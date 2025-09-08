from fastapi import FastAPI, UploadFile, File, Form, Request, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Congregant
from .services.import_excel import import_excel_to_db
from .services.query import get_olim_for_date
import os


DB_PATH = os.environ.get("DB_PATH", "/workspace/data/app.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="מערכת גבאי", default_response_class=HTMLResponse)

app.mount("/static", StaticFiles(directory="/workspace/app/static"), name="static")
templates = Jinja2Templates(directory="/workspace/app/templates")


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/upload", response_class=HTMLResponse)
async def upload_excel(request: Request, file: UploadFile = File(...)):
    session = SessionLocal()
    try:
        contents = await file.read()
        import_excel_to_db(session, contents, filename=file.filename)
        session.commit()
        message = "הייבוא הצליח"
    except Exception as exc:  # noqa: BLE001
        session.rollback()
        message = f"שגיאה ביבוא: {exc}"
    finally:
        session.close()
    return templates.TemplateResponse("index.html", {"request": request, "message": message})


@app.get("/olim", response_class=HTMLResponse)
def get_olim_page(request: Request, date: str = Query(None, description="YYYY-MM-DD")):
    olim = []
    if date:
        session = SessionLocal()
        try:
            olim = get_olim_for_date(session, date)
        finally:
            session.close()
    return templates.TemplateResponse("olim.html", {"request": request, "date": date, "olim": olim})


@app.get("/api/olim", response_class=JSONResponse)
def api_olim(date: str = Query(..., description="YYYY-MM-DD")):
    session = SessionLocal()
    try:
        olim = get_olim_for_date(session, date)
        return JSONResponse(content=olim)
    finally:
        session.close()

