import logging
from uuid import UUID
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from src.repository.database_repository import AuthorRepository
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS
# pyrefly: ignore [missing-import]
from src.models.author import AuthorModel

logger = logging.getLogger(__name__)


class AuthorService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AuthorRepository(db)

    async def get_all_authors(self):
        authors = self.repo.get_all_authors()
        return {
            "success": True,
            "message": "Authors retrieved successfully.",
            "data": authors
        }

    async def get_author_by_id(self, author_id: UUID):
        author = self.repo.get_author_by_id(author_id)
        if not author:
            raise ApplicationException(ERRORS["AUTHOR_ERROR_001"])
        return {
            "success": True,
            "message": "Author retrieved successfully.",
            "data": author
        }

    async def create_author(self, payload):
        if not payload.first_name.strip() or not payload.last_name.strip():
            raise ApplicationException(ERRORS["AUTHOR_ERROR_002"])
        
        new_author = AuthorModel(
            first_name=payload.first_name.strip(),
            last_name=payload.last_name.strip(),
            bio=payload.bio.strip() if payload.bio else None
        )
        created = self.repo.create_author(new_author)
        return {
            "success": True,
            "message": "Author created successfully.",
            "data": created
        }

    async def update_author(self, author_id: UUID, payload):
        author = self.repo.get_author_by_id(author_id)
        if not author:
            raise ApplicationException(ERRORS["AUTHOR_ERROR_001"])
        
        updated = False
        if payload.first_name is not None:
            first_name = payload.first_name.strip()
            if not first_name:
                raise ApplicationException(ERRORS["AUTHOR_ERROR_002"])
            author.first_name = first_name
            updated = True

        if payload.last_name is not None:
            last_name = payload.last_name.strip()
            if not last_name:
                raise ApplicationException(ERRORS["AUTHOR_ERROR_002"])
            author.last_name = last_name
            updated = True

        if payload.bio is not None:
            author.bio = payload.bio.strip() if payload.bio else None
            updated = True

        if updated:
            self.db.commit()
            self.db.refresh(author)

        return {
            "success": True,
            "message": "Author updated successfully.",
            "data": author
        }

    async def delete_author(self, author_id: UUID):
        author = self.repo.get_author_by_id(author_id)
        if not author:
            raise ApplicationException(ERRORS["AUTHOR_ERROR_001"])
        
        self.repo.delete_author(author)
        return {
            "success": True,
            "message": "Author deleted successfully."
        }
