import logging
from uuid import UUID
from typing import List, Optional

# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.models.author import AuthorModel
# pyrefly: ignore [missing-import]
from src.models.book import BookModel
# pyrefly: ignore [missing-import]
from src.models.category import CategoryModel

logger = logging.getLogger(__name__)


# ─── Author Repository ────────────────────────────────────────────────────────

class AuthorRepository:

    def __init__(self, db_session):
        self.db = db_session

    def get_author_by_id(self, author_id: UUID) -> AuthorModel | None:
        try:
            return (
                self.db.query(AuthorModel)
                .filter(AuthorModel.id == author_id)
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting author by id: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_all_authors(self) -> list[AuthorModel]:
        try:
            return self.db.query(AuthorModel).all()
        except Exception as e:
            logger.error(f"Error getting all authors: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def create_author(self, author: AuthorModel) -> AuthorModel:
        try:
            self.db.add(author)
            self.db.commit()
            self.db.refresh(author)
            return author
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating author: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def delete_author(self, author: AuthorModel) -> bool:
        try:
            self.db.delete(author)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting author: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])


# ─── Category Repository ──────────────────────────────────────────────────────

class CategoryRepository:

    def __init__(self, db_session):
        self.db = db_session

    def get_all_categories(self) -> List[CategoryModel]:
        try:
            return self.db.query(CategoryModel).all()
        except Exception as e:
            logger.error(f"Error getting all categories: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_category_by_id(self, category_id: UUID) -> Optional[CategoryModel]:
        try:
            return (
                self.db.query(CategoryModel)
                .filter(CategoryModel.id == category_id)
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting category by id: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_category_by_name(self, name: str) -> Optional[CategoryModel]:
        try:
            return (
                self.db.query(CategoryModel)
                .filter(CategoryModel.name == name)
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting category by name: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def create_category(self, category: CategoryModel) -> CategoryModel:
        try:
            self.db.add(category)
            self.db.commit()
            self.db.refresh(category)
            return category
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating category: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def delete_category(self, category: CategoryModel) -> bool:
        try:
            self.db.delete(category)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting category: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])


# ─── Book Repository ──────────────────────────────────────────────────────────

class BookRepository:

    def __init__(self, db_session):
        self.db = db_session

    def get_all_books(self) -> List[BookModel]:
        try:
            return self.db.query(BookModel).all()
        except Exception as e:
            logger.error(f"Error getting all books: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_book_by_id(self, book_id: UUID) -> Optional[BookModel]:
        try:
            return (
                self.db.query(BookModel)
                .filter(BookModel.id == book_id)
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting book by id: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_book_by_isbn(self, isbn: str) -> Optional[BookModel]:
        try:
            return (
                self.db.query(BookModel)
                .filter(BookModel.isbn == isbn)
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting book by ISBN: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def create_book(self, book: BookModel) -> BookModel:
        try:
            self.db.add(book)
            self.db.commit()
            self.db.refresh(book)
            return book
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating book: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def delete_book(self, book: BookModel) -> bool:
        try:
            self.db.delete(book)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting book: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])
