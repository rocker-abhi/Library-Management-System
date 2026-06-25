import logging
from uuid import UUID
from typing import Optional

# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.models.borrow_record import Borrow_Record_model

logger = logging.getLogger(__name__)

class BorrowRepository:
    def __init__(self, db_session):
        self.db = db_session

    def create_borrow_record(self, record: Borrow_Record_model) -> Borrow_Record_model:
        try:
            self.db.add(record)
            self.db.commit()
            self.db.refresh(record)
            return record
        except Exception as e:
            logger.error(f"Error creating borrow record: {e}")
            self.db.rollback()
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_borrow_record_by_id(self, record_id: UUID) -> Optional[Borrow_Record_model]:
        try:
            return (
                self.db.query(Borrow_Record_model)
                .filter(Borrow_Record_model.id == record_id)
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting borrow record by id: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_all_borrow_records(self) -> list[Borrow_Record_model]:
        try:
            return (
                self.db.query(Borrow_Record_model)
                .order_by(Borrow_Record_model.created_at.desc())
                .all()
            )
        except Exception as e:
            logger.error(f"Error getting all borrow records: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])
