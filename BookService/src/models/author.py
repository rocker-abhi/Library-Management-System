from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class AuthorModel(BaseModel):
    __tablename__ = "author"
    __table_args__ = {"schema": "book_service"}

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    # Many-to-many relationship with BookModel via book_author
    books: Mapped[list["BookModel"]] = relationship(
        "BookModel",
        secondary="book_service.book_author",
        back_populates="authors",
    )

    # One-to-many relationship with BookAuthorModel
    book_authors: Mapped[list["BookAuthorModel"]] = relationship(
        "BookAuthorModel", back_populates="author", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Author {self.first_name} {self.last_name}>"
