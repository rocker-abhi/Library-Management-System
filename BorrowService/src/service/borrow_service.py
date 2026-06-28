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
from src.validators.borrow_validator import BorrowCreateRequest, BorrowUpdateRequest
# pyrefly: ignore [missing-import]
from src.grpc.client.auth_grpc_client import AuthGrpcClient
# pyrefly: ignore [missing-import]
from src.enums.payment_state import PaymentEnums


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
            borrower_id=payload.borrower_id,
            borrow_date=payload.borrow_date,
            due_date=payload.due_date,
            status="Active"
        )

        created_record = self.repo.create_borrow_record(record)
        # Set default fine of 0.0 for a newly created borrow record
        created_record.fine = 0.0

        client = AuthGrpcClient()
        try:
            created_record.borrower_name = client.get_username_by_user_id(str(created_record.borrower_id)) or "Unknown User"
        finally:
            client.close()

        return {
            "success": True,
            "message": "Book borrowed successfully.",
            "data": created_record
        }

    async def get_all_borrow_records(self):
        records = self.repo.get_all_borrow_records()
        today = date.today()

        client = AuthGrpcClient()
        try:
            for record in records:
                fine = 0.0
                if record.borrow_payment_state in [PaymentEnums.PAID, PaymentEnums.WAIVED, "paid", "waived"]:
                    fine = 0.0
                elif record.return_date:
                    if record.return_date > record.due_date:
                        fine = float((record.return_date - record.due_date).days * 20.0)
                else:
                    if today > record.due_date:
                        fine = float((today - record.due_date).days * 20.0)
                    elif record.status == "Overdue":
                        fine = 10.0
                record.fine = fine
                
                # Fetch username using gRPC client
                username = client.get_username_by_user_id(str(record.borrower_id))
                record.borrower_name = username or "Unknown User"
        finally:
            client.close()

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
        if payload.borrower_id is not None:
            record.borrower_id = payload.borrower_id
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
        if payload.borrow_payment_state is not None:
            record.borrow_payment_state = payload.borrow_payment_state.strip()

        self.db.commit()
        self.db.refresh(record)

        # Calculate fine for the updated record
        today = date.today()
        fine = 0.0
        if record.borrow_payment_state in [PaymentEnums.PAID, PaymentEnums.WAIVED, "paid", "waived"]:
            fine = 0.0
        elif record.return_date:
            if record.return_date > record.due_date:
                fine = float((record.return_date - record.due_date).days * 20.0)
        else:
            if today > record.due_date:
                fine = float((today - record.due_date).days * 20.0)
            elif record.status == "Overdue":
                fine = 10.0
        record.fine = fine

        client = AuthGrpcClient()
        try:
            record.borrower_name = client.get_username_by_user_id(str(record.borrower_id)) or "Unknown User"
        except Exception as e:
            logger.error("Unable to fetch borrower_name from auth gRPC server: %s", e)
            record.borrower_name = "Unknown User"
        finally:
            client.close()

        return {
            "success": True,
            "message": "Borrow transaction updated successfully.",
            "data": record
        }

    async def pay_fine(self, record_id: UUID):
        """Mark the fine for a borrow record as paid."""
        record = self.repo.get_borrow_record_by_id(record_id)
        if not record:
            raise ApplicationException(ERRORS["BORROW_ERROR_002"])

        record.borrow_payment_state = PaymentEnums.PAID
        if record.status != "Returned":
            record.status = "Returned"
        if not record.return_date:
            record.return_date = date.today()

        self.db.commit()
        self.db.refresh(record)

        # Fine becomes 0 after payment
        record.fine = 0.0

        client = AuthGrpcClient()
        try:
            record.borrower_name = client.get_username_by_user_id(str(record.borrower_id)) or "Unknown User"
        except Exception as e:
            logger.error("Unable to fetch borrower_name from auth gRPC server: %s", e)
            record.borrower_name = "Unknown User"
        finally:
            client.close()

        return {
            "success": True,
            "message": "Fine marked as paid successfully.",
            "data": record
        }

    async def waive_fine(self, record_id: UUID):
        """Waive the fine for a borrow record."""
        record = self.repo.get_borrow_record_by_id(record_id)
        if not record:
            raise ApplicationException(ERRORS["BORROW_ERROR_002"])

        record.borrow_payment_state = PaymentEnums.WAIVED

        self.db.commit()
        self.db.refresh(record)

        # Fine becomes 0 after waiver
        record.fine = 0.0

        client = AuthGrpcClient()
        try:
            record.borrower_name = client.get_username_by_user_id(str(record.borrower_id)) or "Unknown User"
        except Exception as e:
            logger.error("Unable to fetch borrower_name from auth gRPC server: %s", e)
            record.borrower_name = "Unknown User"
        finally:
            client.close()

        return {
            "success": True,
            "message": "Fine waived successfully.",
            "data": record
        }
