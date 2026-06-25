import sys
import os
import grpc
import logging
import uuid

# Add the parent folder of src to path, which is AuthService root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
# Add generated folder to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'generated'))

import auth_grpc_pb2
# pyrefly: ignore [missing-import]
import auth_grpc_pb2_grpc

# pyrefly: ignore [missing-import]
from src.extensions.database_extension import postgres_database
# pyrefly: ignore [missing-import]
from src.repository.database_repository import UserRepository

logger = logging.getLogger(__name__)

class AuthServiceServicer(auth_grpc_pb2_grpc.AuthServiceServicer):
    def GetUsernameByUserId(self, request, context):
        user_id = request.user_id
        logger.info(f"Received gRPC GetUsernameByUserId request for user_id: {user_id}")
        if not user_id:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("user_id is required")
            return auth_grpc_pb2.GetUsernameResponse(username="")
        
        try:
            uid = uuid.UUID(user_id)
        except ValueError:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("Invalid UUID format for user_id")
            return auth_grpc_pb2.GetUsernameResponse(username="")
        
        db = postgres_database.get_session()
        try:
            repo = UserRepository(db)
            user = repo.get_user_by_id(uid)
            if not user:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"User with ID {user_id} not found")
                return auth_grpc_pb2.GetUsernameResponse(username="")
            return auth_grpc_pb2.GetUsernameResponse(username=user.username)
        except Exception as e:
            logger.error(f"Error querying user database: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details("Internal server error")
            return auth_grpc_pb2.GetUsernameResponse(username="")
        finally:
            db.close()
