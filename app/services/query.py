from __future__ import annotations

from datetime import date as Date
from sqlalchemy.orm import Session
from ..models import Congregant
from pyluach.dates import HebrewDate, GregorianDate
from hdate import HDate


PARASHA_FIELD = "parasha"


def get_olim_for_date(session: Session, iso_date: str) -> list[dict]:
    target = _parse_iso_date(iso_date)
    if target is None:
        return []

    parasha_name = _get_parasha_for_shabbat(target)

    results: list[dict] = []

    # Match parasha preference
    if parasha_name:
        for c in session.query(Congregant).filter(Congregant.parasha.is_not(None)).all():
            if _normalize(c.parasha) == _normalize(parasha_name):
                results.append(_to_dict(c, reason=f"פרשת {parasha_name}"))

    # Match yahrzeit today
    for c in session.query(Congregant).filter(Congregant.yahrzeit_date.is_not(None)).all():
        try:
            if _is_yahrzeit_today(c.yahrzeit_date, target):
                results.append(_to_dict(c, reason="יום זכרון"))
        except Exception:  # noqa: BLE001
            continue

    # Sort by name
    results.sort(key=lambda r: r["full_name"]) 
    return results


def _parse_iso_date(iso: str) -> Date | None:
    try:
        parts = [int(p) for p in iso.split("-")]
        return Date(parts[0], parts[1], parts[2])
    except Exception:  # noqa: BLE001
        return None


def _get_parasha_for_shabbat(d: Date) -> str | None:
    # Find the upcoming/nearest Shabbat (Saturday) for the given date (assuming Shabbat services)
    weekday = d.weekday()  # Monday=0 ... Sunday=6
    # Map to Saturday index in Python is 5
    days_ahead = (5 - weekday) % 7
    shabbat = d if days_ahead == 0 else (d.fromordinal(d.toordinal() + days_ahead))

    g = GregorianDate(shabbat.year, shabbat.month, shabbat.day)
    h = HDate(g)
    parasha = h.get_parasha()
    if not parasha:
        return None
    # hdate returns tuple/list of parshiot if combined; join with hyphen
    if isinstance(parasha, (list, tuple)):
        return "-".join(parasha)
    return str(parasha)


def _is_yahrzeit_today(iso_yahrzeit: str, target: Date) -> bool:
    # Convert the stored Gregorian yahrzeit to Hebrew date, then compare Hebrew date for the current year
    y_parts = [int(p) for p in iso_yahrzeit.split("-")]
    y_g = GregorianDate(y_parts[0], y_parts[1], y_parts[2])
    y_h: HebrewDate = y_g.to_heb()

    # Convert target date to Hebrew date for current year
    t_g = GregorianDate(target.year, target.month, target.day)
    t_h: HebrewDate = t_g.to_heb()

    # Handle Adar leap year rules: If original is Adar I or Adar II, follow common minhag: in non-leap year, Adar II -> Adar, Adar I -> Shevat 30 when applicable. Here we follow pyluach normalization via from_ymd if needed.
    # Compare month and day directly in Hebrew calendar year of target
    try:
        normalized = HebrewDate(t_h.year, y_h.month, min(y_h.day, HebrewDate(t_h.year, y_h.month, 1).month_length()))
    except Exception:  # noqa: BLE001
        normalized = HebrewDate(t_h.year, y_h.month, y_h.day)

    return (t_h.month, t_h.day) == (normalized.month, normalized.day)


def _normalize(s: str | None) -> str:
    if not s:
        return ""
    return str(s).strip().lower().replace(" ", "")


def _to_dict(c: Congregant, reason: str) -> dict:
    return {
        "full_name": c.full_name,
        "father_name": c.father_name,
        "parasha": c.parasha,
        "yahrzeit_date": c.yahrzeit_date,
        "reason": reason,
    }

