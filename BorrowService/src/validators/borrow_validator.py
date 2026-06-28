from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class BorrowCreateRequest(BaseModel):
    book_id: Optional[UUID] = None
    book_title: str = Field(..., min_length=1, max_length=255)
    borrower_id: UUID
    borrow_date: date
    due_date: date

class BorrowRecordResponse(BaseModel):
    id: UUID
    book_id: Optional[UUID] = None
    book_title: str
    borrower_id: UUID
    borrower_name: Optional[str] = None
    borrow_date: date

    due_date: date
    return_date: Optional[date] = None
    status: str
    fine: float = 0.0
    borrow_payment_state: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BorrowResponse(BaseModel):
    success: bool
    message: str
    data: BorrowRecordResponse

class BorrowListResponse(BaseModel):
    success: bool
    data: list[BorrowRecordResponse]

class BorrowUpdateRequest(BaseModel):
    borrower_id: Optional[UUID] = None
    borrow_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    return_date: Optional[date] = None
    borrow_payment_state: Optional[str] = None
