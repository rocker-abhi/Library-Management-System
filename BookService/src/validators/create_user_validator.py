import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

# pyrefly: ignore [missing-import]
from src.enums.user_account_type_enum import UserAccountTypeEnum

class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    account_type: UserAccountTypeEnum = UserAccountTypeEnum.customer

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r"^[a-zA-Z0-9._-]+$", value):
            raise ValueError("Username may only contain letters, numbers, dots, underscores, and hyphens")
        return value.lower()

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

class CreateUserResponseData(BaseModel):
    user_data: UserResponse
    user_otp: str

class CreateUserResponse(BaseModel):
    success: bool
    message: str
    data: CreateUserResponseData


class DeleteUserResponse(BaseModel):
    success: bool
    message: str


class UpdateUserRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    account_type: Optional[UserAccountTypeEnum] = None
    is_active: Optional[bool] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        if not re.fullmatch(r"^[a-zA-Z0-9._-]+$", value):
            raise ValueError("Username may only contain letters, numbers, dots, underscores, and hyphens")
        return value.lower()


class UpdateUserResponse(BaseModel):
    success: bool
    message: str
    data: UserResponse
