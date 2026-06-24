import logging
from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from src.repository.database_repository import BookRepository, AuthorRepository, CategoryRepository
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS
# pyrefly: ignore [missing-import]
from src.models.book import BookModel

logger = logging.getLogger(__name__)


class BookService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BookRepository(db)
        self.author_repo = AuthorRepository(db)
        self.category_repo = CategoryRepository(db)

    # ── List all ──────────────────────────────────────────────────────────────

    async def get_all_books(self):
        books = self.repo.get_all_books()
        return {
            "success": True,
            "message": "Books retrieved successfully.",
            "data": books
        }

    # ── Get one ───────────────────────────────────────────────────────────────

    async def get_book_by_id(self, book_id: UUID):
        book = self.repo.get_book_by_id(book_id)
        if not book:
            raise ApplicationException(ERRORS["BOOK_ERROR_001"])
        return {
            "success": True,
            "message": "Book retrieved successfully.",
            "data": book
        }

    # ── Create ────────────────────────────────────────────────────────────────

    async def create_book(self, payload):
        # Validate required fields
        if not payload.title.strip() or not payload.isbn.strip():
            raise ApplicationException(ERRORS["BOOK_ERROR_003"])

        # Check copy counts
        if payload.available_copies > payload.total_copies:
            raise ApplicationException(ERRORS["BOOK_ERROR_004"])

        # Ensure ISBN is unique
        existing = self.repo.get_book_by_isbn(payload.isbn.strip())
        if existing:
            raise ApplicationException(ERRORS["BOOK_ERROR_002"])

        # Validate category if given
        if payload.category_id:
            category = self.category_repo.get_category_by_id(payload.category_id)
            if not category:
                raise ApplicationException(ERRORS["CATEGORY_ERROR_001"])

        # Validate authors if given
        authors: List = []
        if payload.author_ids:
            for author_id in payload.author_ids:
                author = self.author_repo.get_author_by_id(author_id)
                if not author:
                    raise ApplicationException(ERRORS["AUTHOR_ERROR_001"])
                authors.append(author)

        new_book = BookModel(
            title=payload.title.strip(),
            isbn=payload.isbn.strip(),
            description=payload.description.strip() if payload.description else None,
            published_date=payload.published_date,
            category_id=payload.category_id,
            total_copies=payload.total_copies,
            available_copies=payload.available_copies,
        )
        # Assign authors via relationship so the junction table is populated
        new_book.authors = authors

        created = self.repo.create_book(new_book)
        return {
            "success": True,
            "message": "Book created successfully.",
            "data": created
        }

    # ── Update ────────────────────────────────────────────────────────────────

    async def update_book(self, book_id: UUID, payload):
        book = self.repo.get_book_by_id(book_id)
        if not book:
            raise ApplicationException(ERRORS["BOOK_ERROR_001"])

        updated = False

        if payload.title is not None:
            title = payload.title.strip()
            if not title:
                raise ApplicationException(ERRORS["BOOK_ERROR_003"])
            book.title = title
            updated = True

        if payload.isbn is not None:
            isbn = payload.isbn.strip()
            if not isbn:
                raise ApplicationException(ERRORS["BOOK_ERROR_003"])
            # Check duplicate (exclude current book)
            existing = self.repo.get_book_by_isbn(isbn)
            if existing and existing.id != book_id:
                raise ApplicationException(ERRORS["BOOK_ERROR_002"])
            book.isbn = isbn
            updated = True

        if payload.description is not None:
            book.description = payload.description.strip() if payload.description else None
            updated = True

        if payload.published_date is not None:
            book.published_date = payload.published_date
            updated = True

        if payload.category_id is not None:
            category = self.category_repo.get_category_by_id(payload.category_id)
            if not category:
                raise ApplicationException(ERRORS["CATEGORY_ERROR_001"])
            book.category_id = payload.category_id
            updated = True

        # Validate copy constraints after any updates
        new_total     = payload.total_copies     if payload.total_copies     is not None else book.total_copies
        new_available = payload.available_copies if payload.available_copies is not None else book.available_copies
        if new_available > new_total:
            raise ApplicationException(ERRORS["BOOK_ERROR_004"])
        if payload.total_copies is not None:
            book.total_copies = payload.total_copies
            updated = True
        if payload.available_copies is not None:
            book.available_copies = payload.available_copies
            updated = True

        if payload.author_ids is not None:
            authors = []
            for author_id in payload.author_ids:
                author = self.author_repo.get_author_by_id(author_id)
                if not author:
                    raise ApplicationException(ERRORS["AUTHOR_ERROR_001"])
                authors.append(author)
            book.authors = authors
            updated = True

        if updated:
            self.db.commit()
            self.db.refresh(book)

        return {
            "success": True,
            "message": "Book updated successfully.",
            "data": book
        }

    # ── Delete ────────────────────────────────────────────────────────────────

    async def delete_book(self, book_id: UUID):
        book = self.repo.get_book_by_id(book_id)
        if not book:
            raise ApplicationException(ERRORS["BOOK_ERROR_001"])

        self.repo.delete_book(book)
        return {
            "success": True,
            "message": "Book deleted successfully."
        }
