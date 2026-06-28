from datetime import date
from uuid import UUID

from sqlalchemy import Date, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

# pyrefly: ignore [missing-import]
from src.models.base import BaseModel
# pyrefly: ignore [missing-import]
from src.enums.Borrow_enums import BorrowEnums
# pyrefly: ignore [missing-import]
from src.enums.payment_state import PaymentEnums


class Borrow_Record_model(BaseModel):
    __tablename__ = "borrow_record"
    __table_args__ = {"schema": "borrow_service"}

    book_id: Mapped[UUID | None] = mapped_column(Uuid, nullable=True)
    book_title: Mapped[str] = mapped_column(String(255), nullable=False)
    borrower_id: Mapped[UUID] = mapped_column(Uuid, nullable=False)
    borrow_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    return_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=BorrowEnums.ACTIVE
    )
    borrow_payment_state: Mapped[str | None] = mapped_column(
        String(50), nullable=True, default=PaymentEnums.UNPAID
    )

    def __repr__(self) -> str:
        return f"<BorrowRecord borrower_id={self.borrower_id} - {self.book_title}>"