from uuid import UUID
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class RolePermissionModel(BaseModel):
    __tablename__ = "role_permission"
    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
        {"schema": "auth_service"}
    )

    role_id: Mapped[UUID] = mapped_column(
        ForeignKey("auth_service.role.id", ondelete="CASCADE"),
        nullable=False
    )

    permission_id: Mapped[UUID] = mapped_column(
        ForeignKey("auth_service.permission.id", ondelete="CASCADE"),
        nullable=False
    )

    def __repr__(self):
        return f"<RolePermission role_id={self.role_id} permission_id={self.permission_id}>"
