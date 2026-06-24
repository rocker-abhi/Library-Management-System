import re
from pydantic import BaseModel, Field, field_validator


class LoginRequest(BaseModel):

    username: str = Field(
        ...,
        min_length=3,
        max_length=50
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128
    )

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Username cannot be empty"
            )

        if len(value) < 3:
            raise ValueError(
                "Username must be at least 3 characters long"
            )

        if len(value) > 50:
            raise ValueError(
                "Username cannot exceed 50 characters"
            )

        if not re.fullmatch(r"^[a-zA-Z0-9._-]+$", value):
            raise ValueError(
                "Username may only contain letters, numbers, dots, underscores, and hyphens"
            )

        return value.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:

        if value != value.strip():
            raise ValueError(
                "Password cannot start or end with spaces"
            )

        if len(value) < 8:
            raise ValueError(
                "Password must be at least 8 characters long"
            )

        if len(value) > 128:
            raise ValueError(
                "Password cannot exceed 128 characters"
            )

        return value

# Model for LoginData and LoginResponse

class LoginData(BaseModel):

    access_token: str

    refresh_token: str
    user_id : str
    role : str
    permissions: list[str]
    token_type: str = "Bearer"


class LoginResponse(BaseModel):

    success: bool

    message: str

    data: LoginData


class ResetPasswordRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    old_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Username cannot be empty")
        if len(value) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if len(value) > 50:
            raise ValueError("Username cannot exceed 50 characters")
        if not re.fullmatch(r"^[a-zA-Z0-9._-]+$", value):
            raise ValueError("Username may only contain letters, numbers, dots, underscores, and hyphens")
        return value.lower()

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        if value != value.strip():
            raise ValueError("Password cannot start or end with spaces")
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(value) > 128:
            raise ValueError("Password cannot exceed 128 characters")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", value):
            raise ValueError("Password must contain at least one special character")
        return value


class ResetPasswordResponse(BaseModel):
    success: bool
    message: str