from datetime import date
from uuid import UUID

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class BookModel(BaseModel):
    __tablename__ = "book"
    __table_args__ = {"schema": "book_service"}

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    isbn: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    category_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("book_service.category.id", ondelete="SET NULL"),
        nullable=True,
    )
    total_copies: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    available_copies: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )

    # Relationships
    # Many-to-one relationship with CategoryModel
    category: Mapped["CategoryModel | None"] = relationship(
        "CategoryModel", back_populates="books"
    )

    # Many-to-many relationship with AuthorModel via book_author
    authors: Mapped[list["AuthorModel"]] = relationship(
        "AuthorModel",
        secondary="book_service.book_author",
        back_populates="books",
    )

    # One-to-many relationship with BookAuthorModel
    book_authors: Mapped[list["BookAuthorModel"]] = relationship(
        "BookAuthorModel", back_populates="book", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Book {self.title} (ISBN: {self.isbn})>"
