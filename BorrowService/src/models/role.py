from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class RoleModel(BaseModel):
    __tablename__ = "role"
    __table_args__ = {
        "schema": "auth_service"
    }

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # One-to-many relationship with UserModel
    users: Mapped[list["UserModel"]] = relationship(
        "UserModel",
        back_populates="role"
    )

    # Many-to-many relationship with PermissionModel
    permissions: Mapped[list["PermissionModel"]] = relationship(
        "PermissionModel",
        secondary="auth_service.role_permission",
        back_populates="roles"
    )

    def __repr__(self):
        return f"<Role {self.name}>"
