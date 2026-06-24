from uuid import UUID

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class BookAuthorModel(BaseModel):
    __tablename__ = "book_author"
    __table_args__ = (
        UniqueConstraint("book_id", "author_id", name="uq_book_author"),
        {"schema": "book_service"},
    )

    book_id: Mapped[UUID] = mapped_column(
        ForeignKey("book_service.book.id", ondelete="CASCADE"), nullable=False
    )
    author_id: Mapped[UUID] = mapped_column(
        ForeignKey("book_service.author.id", ondelete="CASCADE"), nullable=False
    )

    # Relationships
    # Many-to-one relationship with BookModel
    book: Mapped["BookModel"] = relationship(
        "BookModel", back_populates="book_authors"
    )

    # Many-to-one relationship with AuthorModel
    author: Mapped["AuthorModel"] = relationship(
        "AuthorModel", back_populates="book_authors"
    )

    def __repr__(self) -> str:
        return f"<BookAuthor book_id={self.book_id} author_id={self.author_id}>"
