from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class AuthorCreateRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    bio: Optional[str] = None


class AuthorUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = None


class AuthorResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuthorSingleResponse(BaseModel):
    success: bool
    message: str
    data: AuthorResponse


class AuthorListResponse(BaseModel):
    success: bool
    message: str
    data: List[AuthorResponse]


class AuthorDeleteResponse(BaseModel):
    success: bool
    message: str
