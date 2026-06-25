from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class BorrowCreateRequest(BaseModel):
    book_id: Optional[UUID] = None
    book_title: str = Field(..., min_length=1, max_length=255)
    borrower_name: str = Field(..., min_length=1, max_length=255)
    borrow_date: date
    due_date: date

class BorrowRecordResponse(BaseModel):
    id: UUID
    book_id: Optional[UUID] = None
    book_title: str
    borrower_name: str
    borrow_date: date
    due_date: date
    return_date: Optional[date] = None
    status: str
    fine: float = 0.0
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
    borrower_name: Optional[str] = Field(None, min_length=1, max_length=255)
    borrow_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    return_date: Optional[date] = None
