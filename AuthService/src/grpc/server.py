import sys
import os
import time
import grpc
from concurrent import futures
import logging
import uuid

# Add the parent folder of src to path, which is AuthService root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
# Add generated folder to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'generated'))

import auth_grpc_pb2
import auth_grpc_pb2_grpc

from src.extensions.configurations import settings
from src.extensions.database_extension import init_db, postgres_database
from src.repository.database_repository import UserRepository

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

from src.grpc.service.auth_service_impl import AuthServiceServicer

def serve():
    logger.info("Initializing Database for gRPC Server...")
    init_db(settings.DATABASE_URL)
    
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    auth_grpc_pb2_grpc.add_AuthServiceServicer_to_server(AuthServiceServicer(), server)
    
    host = settings.GRPC_HOST or "0.0.0.0"
    port = settings.GRPC_PORT or 5100
    listen_addr = f"{host}:{port}"
    
    server.add_insecure_port(listen_addr)
    logger.info(f"gRPC Server starting on {listen_addr}...")
    server.start()
    
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        logger.info("gRPC Server stopping...")
        server.stop(0)

if __name__ == "__main__":
    serve()
