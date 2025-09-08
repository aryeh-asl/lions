from __future__ import annotations

import io
import pandas as pd
from sqlalchemy.orm import Session
from ..models import Congregant


EXPECTED_COLUMNS = {
    "full_name": ["שם", "שם מלא", "שם_מלא", "FullName", "full_name"],
    "father_name": ["שם האב", "אב", "Father", "father_name"],
    "parasha": ["פרשה", "Parasha", "parasha"],
    "yahrzeit_date": ["יום זכרון", "יזכר", "Yahrzeit", "yahrzeit", "yahrzeit_date"],
    "notes": ["הערות", "Notes", "notes"],
}


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    mapping: dict[str, str] = {}
    lower_cols = {c.lower().strip(): c for c in df.columns}
    for target, candidates in EXPECTED_COLUMNS.items():
        for cand in candidates:
            key = cand.lower()
            if key in lower_cols:
                mapping[target] = lower_cols[key]
                break
    # Rename only the found columns; ignore missing ones gracefully
    df = df.rename(columns={v: k for k, v in mapping.items()})
    return df


def import_excel_to_db(session: Session, content: bytes, filename: str | None = None) -> None:
    buffer = io.BytesIO(content)
    df = pd.read_excel(buffer)
    df = _normalize_columns(df)

    rows = []
    for _, row in df.iterrows():
        full_name = str(row.get("full_name", "")).strip()
        if not full_name:
            continue
        congregant = Congregant(
            full_name=full_name,
            father_name=str(row.get("father_name", "")).strip() or None,
            parasha=str(row.get("parasha", "")).strip() or None,
            yahrzeit_date=_normalize_date(row.get("yahrzeit_date")),
            notes=str(row.get("notes", "")).strip() or None,
        )
        rows.append(congregant)

    # Clear existing data before import to match the provided file
    session.query(Congregant).delete()
    session.add_all(rows)


def _normalize_date(val) -> str | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    # Allow pandas Timestamp, datetime, or string
    try:
        ts = pd.to_datetime(val, errors="coerce")
        if ts is not None and not pd.isna(ts):
            return ts.strftime("%Y-%m-%d")
    except Exception:  # noqa: BLE001
        pass
    try:
        s = str(val).strip()
        if not s:
            return None
        ts = pd.to_datetime(s, errors="coerce", dayfirst=True)
        if ts is not None and not pd.isna(ts):
            return ts.strftime("%Y-%m-%d")
    except Exception:  # noqa: BLE001
        return None
    return None

