import logging
from uuid import UUID
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from src.extensions.database_extension import get_db
# pyrefly: ignore [missing-import]
from src.service.book_service import BookService
# pyrefly: ignore [missing-import]
from src.middlewares.jwt_authentication_middleware import jwt_required
# pyrefly: ignore [missing-import]
from src.validators.book_validator import (
    BookCreateRequest, BookUpdateRequest,
    BookSingleResponse, BookListResponse, BookDeleteResponse
)
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS

logger = logging.getLogger(__name__)

books_router = APIRouter(
    prefix="/books",
    tags=['Book Management']
)


# ── GET /books — list all books ───────────────────────────────────────────────

@books_router.get("", response_model=BookListResponse)
@jwt_required
async def get_all_books(request: Request, db: Session = Depends(get_db)):
    """List all books in the catalog."""
    service = BookService(db)
    return await service.get_all_books()


# ── GET /books/{book_id} — get single book ────────────────────────────────────

@books_router.get("/{book_id}", response_model=BookSingleResponse)
@jwt_required
async def get_book_by_id(request: Request, book_id: UUID, db: Session = Depends(get_db)):
    """Retrieve a single book by its ID."""
    service = BookService(db)
    return await service.get_book_by_id(book_id)


# ── POST /books — create a book ───────────────────────────────────────────────

@books_router.post("", response_model=BookSingleResponse)
@jwt_required
async def create_book(
    request: Request,
    payload: BookCreateRequest,
    db: Session = Depends(get_db)
):
    """Create a new book in the catalog. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    service = BookService(db)
    return await service.create_book(payload)


# ── PUT /books/{book_id} — update a book ─────────────────────────────────────

@books_router.put("/{book_id}", response_model=BookSingleResponse)
@jwt_required
async def update_book(
    request: Request,
    book_id: UUID,
    payload: BookUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update an existing book's details. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    service = BookService(db)
    return await service.update_book(book_id, payload)


# ── DELETE /books/{book_id} — delete a book ───────────────────────────────────

@books_router.delete("/{book_id}", response_model=BookDeleteResponse)
@jwt_required
async def delete_book(
    request: Request,
    book_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a book from the catalog. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    service = BookService(db)
    return await service.delete_book(book_id)
