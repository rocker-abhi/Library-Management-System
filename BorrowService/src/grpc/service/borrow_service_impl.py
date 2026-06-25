import sys
import os
import grpc
import logging
import uuid

# Add the parent folder of src to path, which is BorrowService root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
# Add generated folder to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'generated'))

import borrow_grpc_pb2
import borrow_grpc_pb2_grpc

from src.extensions.database_extension import postgres_database
from src.repository.database_repository import BorrowRepository

logger = logging.getLogger(__name__)

class BorrowServiceServicer(borrow_grpc_pb2_grpc.BorrowServiceServicer):
    def GetBorrowRecord(self, request, context):
        record_id = request.record_id
        logger.info(f"Received gRPC GetBorrowRecord request for record_id: {record_id}")
        if not record_id:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("record_id is required")
            return borrow_grpc_pb2.GetBorrowResponse(borrower_id="", book_title="", status="")
        
        try:
            rid = uuid.UUID(record_id)
        except ValueError:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("Invalid UUID format for record_id")
            return borrow_grpc_pb2.GetBorrowResponse(borrower_id="", book_title="", status="")
        
        db = postgres_database.SessionLocal()
        try:
            repo = BorrowRepository(db)
            record = repo.get_borrow_record_by_id(rid)
            if not record:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"Borrow record with ID {record_id} not found")
                return borrow_grpc_pb2.GetBorrowResponse(borrower_id="", book_title="", status="")
            
            return borrow_grpc_pb2.GetBorrowResponse(
                borrower_id=str(record.borrower_id),
                book_title=record.book_title,
                status=record.status
            )
        except Exception as e:
            logger.error(f"Error querying borrow database: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details("Internal server error")
            return borrow_grpc_pb2.GetBorrowResponse(borrower_id="", book_title="", status="")
        finally:
            db.close()
