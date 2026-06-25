import logging
from sqlalchemy.orm import Session
from datetime import date
from uuid import UUID

# pyrefly: ignore [missing-import]
from src.repository.database_repository import BorrowRepository
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS
# pyrefly: ignore [missing-import]
from src.models.borrow_record import Borrow_Record_model
# pyrefly: ignore [missing-import]
from src.validators.borrow_validator import BorrowCreateRequest, BorrowUpdateRequest

logger = logging.getLogger(__name__)

class BorrowService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BorrowRepository(db)

    async def create_borrow_record(self, payload: BorrowCreateRequest):
        # Validate that due date is not before borrow date
        if payload.due_date < payload.borrow_date:
            raise ApplicationException(ERRORS["BORROW_ERROR_001"])

        # Create borrow record model instance
        record = Borrow_Record_model(
            book_id=payload.book_id,
            book_title=payload.book_title.strip(),
            borrower_name=payload.borrower_name.strip(),
            borrow_date=payload.borrow_date,
            due_date=payload.due_date,
            status="Active"
        )

        created_record = self.repo.create_borrow_record(record)
        # Set default fine of 0.0 for a newly created borrow record
        created_record.fine = 0.0
        return {
            "success": True,
            "message": "Book borrowed successfully.",
            "data": created_record
        }

    async def get_all_borrow_records(self):
        records = self.repo.get_all_borrow_records()
        today = date.today()

        for record in records:
            fine = 0.0
            if record.return_date:
                if record.return_date > record.due_date:
                    fine = float((record.return_date - record.due_date).days * 20.0)
            else:
                if today > record.due_date:
                    fine = float((today - record.due_date).days * 20.0)
                elif record.status == "Overdue":
                    fine = 10.0
            record.fine = fine

        return {
            "success": True,
            "data": records
        }

    async def update_borrow_record(self, record_id: UUID, payload: BorrowUpdateRequest):
        record = self.repo.get_borrow_record_by_id(record_id)
        if not record:
            raise ApplicationException(ERRORS["BORROW_ERROR_002"])

        # Validate date logic if dates are updated
        new_borrow_date = payload.borrow_date if payload.borrow_date is not None else record.borrow_date
        new_due_date = payload.due_date if payload.due_date is not None else record.due_date
        if new_due_date < new_borrow_date:
            raise ApplicationException(ERRORS["BORROW_ERROR_001"])

        # Update fields
        if payload.borrower_name is not None:
            record.borrower_name = payload.borrower_name.strip()
        if payload.borrow_date is not None:
            record.borrow_date = payload.borrow_date
        if payload.due_date is not None:
            record.due_date = payload.due_date
        if payload.status is not None:
            record.status = payload.status.strip()
        if payload.return_date is not None:
            record.return_date = payload.return_date
        elif payload.status == "Returned" and not record.return_date:
            record.return_date = date.today()

        self.db.commit()
        self.db.refresh(record)

        # Calculate fine for the updated record
        today = date.today()
        fine = 0.0
        if record.return_date:
            if record.return_date > record.due_date:
                fine = float((record.return_date - record.due_date).days * 20.0)
        else:
            if today > record.due_date:
                fine = float((today - record.due_date).days * 20.0)
            elif record.status == "Overdue":
                fine = 10.0
        record.fine = fine

        return {
            "success": True,
            "message": "Borrow transaction updated successfully.",
            "data": record
        }
