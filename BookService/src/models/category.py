from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class CategoryModel(BaseModel):
    __tablename__ = "category"
    __table_args__ = {"schema": "book_service"}

    name: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationship to BookModel
    books: Mapped[list["BookModel"]] = relationship(
        "BookModel", back_populates="category", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Category {self.name}>"
