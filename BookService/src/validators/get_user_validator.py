from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

# pyrefly: ignore [missing-import]
from src.enums.user_account_type_enum import UserAccountTypeEnum

class GetUserRequest(BaseModel):
    # Empty request body since it's a GET request
    pass

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    account_type: UserAccountTypeEnum
    role_id: Optional[UUID] = None
    is_active: bool
    is_password_reset: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GetUserResponse(BaseModel):
    success: bool
    data: list[UserResponse]
