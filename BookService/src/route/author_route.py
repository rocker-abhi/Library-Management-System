import logging
from uuid import UUID
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from src.extensions.database_extension import get_db
# pyrefly: ignore [missing-import]
from src.service.author_service import AuthorService
# pyrefly: ignore [missing-import]
from src.middlewares.jwt_authentication_middleware import jwt_required
# pyrefly: ignore [missing-import]
from src.validators.author_validator import (
    AuthorCreateRequest, AuthorUpdateRequest,
    AuthorSingleResponse, AuthorListResponse, AuthorDeleteResponse
)
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS

logger = logging.getLogger(__name__)

author_router = APIRouter(
    prefix="/authors",
    tags=['Author Management']
)


@author_router.get("", response_model=AuthorListResponse)
@jwt_required
async def get_all_authors(request: Request, db: Session = Depends(get_db)):
    """List all authors."""
    service = AuthorService(db)
    result = await service.get_all_authors()
    return result


@author_router.get("/{author_id}", response_model=AuthorSingleResponse)
@jwt_required
async def get_author_by_id(request: Request, author_id: UUID, db: Session = Depends(get_db)):
    """Get author details by ID."""
    service = AuthorService(db)
    result = await service.get_author_by_id(author_id)
    return result


@author_router.post("", response_model=AuthorSingleResponse)
@jwt_required
async def create_author(request: Request, payload: AuthorCreateRequest, db: Session = Depends(get_db)):
    """Create a new author. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    service = AuthorService(db)
    result = await service.create_author(payload)
    return result


@author_router.put("/{author_id}", response_model=AuthorSingleResponse)
@jwt_required
async def update_author(request: Request, author_id: UUID, payload: AuthorUpdateRequest, db: Session = Depends(get_db)):
    """Update an author's details. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    service = AuthorService(db)
    result = await service.update_author(author_id, payload)
    return result


@author_router.delete("/{author_id}", response_model=AuthorDeleteResponse)
@jwt_required
async def delete_author(request: Request, author_id: UUID, db: Session = Depends(get_db)):
    """Delete an author. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    service = AuthorService(db)
    result = await service.delete_author(author_id)
    return result
