import sys
import os
import time
import grpc
from concurrent import futures
import logging

# Add the parent folder of src to path, which is BorrowService root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
# Add generated folder to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'generated'))

import borrow_grpc_pb2
import borrow_grpc_pb2_grpc

from src.grpc.service.borrow_service_impl import BorrowServiceServicer
from src.extensions.configurations import settings
from src.extensions.database_extension import init_db

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def serve():
    logger.info("Initializing Database for Borrow gRPC Server...")
    init_db(settings.DATABASE_URL)
    
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    borrow_grpc_pb2_grpc.add_BorrowServiceServicer_to_server(BorrowServiceServicer(), server)
    
    host = settings.GRPC_HOST or "localhost"
    port = settings.GRPC_PORT or 10200
    listen_addr = f"{host}:{port}"
    
    server.add_insecure_port(listen_addr)
    logger.info(f"Borrow gRPC Server starting on {listen_addr}...")
    server.start()
    
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        logger.info("Borrow gRPC Server stopping...")
        server.stop(0)

if __name__ == "__main__":
    serve()
