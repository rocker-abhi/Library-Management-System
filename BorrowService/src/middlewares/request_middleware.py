import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from uuid import uuid4
import time

logger = logging.getLogger(__name__)

class RequestContextMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid4())
        request.state.request_id = request_id
        start_time = time.time()
        logger.info(f"[{request.method} {request.url.path}] Request ID: {request_id}")
        try:
            response = await call_next(request)
            return response
        finally:
            duration = round(time.time() - start_time, 4)
            logger.info(f"[{request.method} {request.url.path}] Request ID: {request_id} completed in {duration} seconds")



"""
        What goes where?

        Before Request (Middleware)

        Request ID
        Correlation ID
        JWT extraction
        Logging
        Metrics
        Rate limiting

        After Request (Middleware)

        Response time
        Audit logs
        Response headers
        Metrics collection

        Teardown Request (Dependency yield)

        Close DB session
        Rollback transactions
        Release resources

        Application Teardown (Lifespan)

        Close PostgreSQL pool
        Close Redis
        Close Kafka producer
        Flush logs
"""