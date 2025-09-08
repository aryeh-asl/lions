## מערכת גבאי – יבוא אקסל ורשימת עולים

אפליקציית FastAPI פשוטה שמאפשרת:
- העלאת קובץ אקסל קיים ליצירת/עדכון מסד נתונים (SQLite)
- בקשת רשימת עולים לשבת נתונה (על פי פרשה) או לבעלי יום זכרון בתאריך נתון

## דרישות
- Python 3.13

## התקנה והפעלה

1. יצירת סביבה וירטואלית (ללא ensurepip) והתקנת חבילות:

```bash
python3 -m venv --without-pip venv
curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py
./venv/bin/python get-pip.py
./venv/bin/pip install -r requirements.txt hdate
```

2. הרצה מקומית:

```bash
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

בקרו ב: http://localhost:8000

## קובץ אקסל נתמך
עמודות מזוהות (אחת מכל קבוצה – בעברית/אנגלית):
- שם: "שם", "שם מלא", "FullName", "full_name"
- שם האב: "שם האב", "Father", "father_name"
- פרשה: "פרשה", "Parasha", "parasha"
- יום זכרון: "יום זכרון", "Yahrzeit", "yahrzeit_date"
- הערות: "הערות", "Notes"

תאריך יום זכרון יכול להיות בפורמטים סטנדרטיים; ישמר כ-YYYY-MM-DD.

## API
- POST /upload – העלאת אקסל
- GET /olim?date=YYYY-MM-DD – רשימת עולים: מי שהפרשה שלהם מתאימה לשבת הקרובה בתאריך הנתון, או שיש להם יום זכרון בתאריך זה (לפי לוח עברי)
- GET /api/olim?date=YYYY-MM-DD – JSON

## מסד נתונים
SQLite בנתיב ברירת מחדל: /workspace/data/app.db (ניתן לשינוי עם DB_PATH)