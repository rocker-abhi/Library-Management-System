from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime

from src.validators.author_validator import AuthorResponse


# ─── Category schemas (embedded) ────────────────────────────────────────────

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Book request schemas ────────────────────────────────────────────────────

class BookCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    isbn: str = Field(..., min_length=5, max_length=50)
    description: Optional[str] = None
    published_date: Optional[date] = None
    category_id: Optional[UUID] = None
    total_copies: int = Field(default=1, ge=1)
    available_copies: int = Field(default=1, ge=0)
    author_ids: Optional[List[UUID]] = None


class BookUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    isbn: Optional[str] = Field(None, min_length=5, max_length=50)
    description: Optional[str] = None
    published_date: Optional[date] = None
    category_id: Optional[UUID] = None
    total_copies: Optional[int] = Field(None, ge=1)
    available_copies: Optional[int] = Field(None, ge=0)
    author_ids: Optional[List[UUID]] = None


# ─── Book response schemas ───────────────────────────────────────────────────

class BookResponse(BaseModel):
    id: UUID
    title: str
    isbn: str
    description: Optional[str] = None
    published_date: Optional[date] = None
    total_copies: int
    available_copies: int
    category: Optional[CategoryResponse] = None
    authors: Optional[List[AuthorResponse]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BookSingleResponse(BaseModel):
    success: bool
    message: str
    data: BookResponse


class BookListResponse(BaseModel):
    success: bool
    message: str
    data: List[BookResponse]


class BookDeleteResponse(BaseModel):
    success: bool
    message: str
