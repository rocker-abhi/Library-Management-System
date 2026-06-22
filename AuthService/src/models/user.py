from uuid import UUID
from sqlalchemy import ForeignKey, String, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

# pyrefly: ignore [missing-import]
from src.enums.user_account_type_enum import UserAccountTypeEnum as AccountEnum
# pyrefly: ignore [missing-import]
from src.models.base import BaseModel


class UserModel(BaseModel):
    __tablename__ = "user"
    __table_args__ = {
        "schema": "auth_service"
    }

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True  
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    account_type: Mapped[AccountEnum] = mapped_column(
        SQLEnum(AccountEnum, name="user_account_type_enums", schema="auth_service"),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        nullable=False,
        default=True
    )

    is_password_reset: Mapped[bool] = mapped_column(
        nullable=False,
        default=True
    )

    role_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("auth_service.role.id", ondelete="SET NULL"),
        nullable=True
    )

    # Relationship to RoleModel
    role: Mapped["RoleModel | None"] = relationship(
        "RoleModel",
        back_populates="users"
    )

    def __repr__(self):
        return f"<User {self.username}>"
