from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from uuid import UUID

# pyrefly: ignore [missing-import]
from src.extensions.database_extension import get_db
# pyrefly: ignore [missing-import]
from src.middlewares.jwt_authentication_middleware import jwt_required
# pyrefly: ignore [missing-import]
from src.validators.borrow_validator import BorrowCreateRequest, BorrowResponse, BorrowListResponse, BorrowUpdateRequest
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
from src.exceptions.all_exceptions import ERRORS
from src.service.borrow_service import BorrowService

borrow_books_router = APIRouter(
    prefix="/borrow-books",
    tags=["Borrow Books"],
)


@borrow_books_router.post("/", response_model=BorrowResponse)
@jwt_required
async def create_borrow_record(
    request: Request,
    payload: BorrowCreateRequest,
    db: Session = Depends(get_db)
):
    """Create a new borrow book record."""
    caller_role = request.state.user.get("role")
    if caller_role and caller_role.upper() in ["CUSTOMER", "STUDENT", "USER"]:
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])
    service = BorrowService(db)
    return await service.create_borrow_record(payload)


@borrow_books_router.get("/", response_model=BorrowListResponse)
@jwt_required
async def get_all_borrow_records(
    request: Request,
    db: Session = Depends(get_db)
):
    """Retrieve all borrow book records with calculated fines."""
    service = BorrowService(db)
    return await service.get_all_borrow_records()


@borrow_books_router.put("/{record_id}", response_model=BorrowResponse)
@jwt_required
async def update_borrow_record(
    record_id: UUID,
    payload: BorrowUpdateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update an existing borrow book record."""
    service = BorrowService(db)
    return await service.update_borrow_record(record_id, payload)


@borrow_books_router.patch("/{record_id}/pay", response_model=BorrowResponse)
@jwt_required
async def pay_borrow_fine(
    record_id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """Mark the fine for a borrow record as paid. Also marks the book as Returned."""
    service = BorrowService(db)
    return await service.pay_fine(record_id)


@borrow_books_router.patch("/{record_id}/waive", response_model=BorrowResponse)
@jwt_required
async def waive_borrow_fine(
    record_id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """Waive the fine for a borrow record without requiring payment."""
    service = BorrowService(db)
    return await service.waive_fine(record_id)
