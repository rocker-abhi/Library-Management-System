from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class PermissionModel(BaseModel):
    __tablename__ = "permission"
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

    # Many-to-many relationship with RoleModel
    roles: Mapped[list["RoleModel"]] = relationship(
        "RoleModel",
        secondary="auth_service.role_permission",
        back_populates="permissions"
    )

    def __repr__(self):
        return f"<Permission {self.name}>"
