from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Date


class Base(DeclarativeBase):
    pass


class Congregant(Base):
    __tablename__ = "congregants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Full Hebrew name
    full_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    # Father name (for aliyot or yahrzeit announcements)
    father_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Parasha preference/name if relevant
    parasha: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    # Gregorian date of yahrzeit (we will normalize and also compute Hebrew date each year)
    yahrzeit_date: Mapped[str | None] = mapped_column(String(10), index=True, nullable=True)  # YYYY-MM-DD
    # Notes
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

