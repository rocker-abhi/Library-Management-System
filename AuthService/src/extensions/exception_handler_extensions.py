from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class ApplicationException(Exception):
    error_code: str
    status_code: int
    message: str

    def __init__(self, error: dict):
        self.message = error.get("message") or "Something went wrong"
        super().__init__(self.message)
        self.error_code = error.get("error_code") or "internal"
        self.status_code = int(error.get("status_code") or 500)


async def app_exception_handler(
    request: Request,
    exc: Exception
):  
    app_exc = exc if isinstance(exc, ApplicationException) else ApplicationException({"message": "Something went wrong", "error_code": "internal", "status_code": 500})
    request_id = getattr(request.state, "request_id", None)
    logger.warning(
        "[%s] [%s] %s",
        request_id,
        app_exc.error_code,
        app_exc.message
    )

    return JSONResponse(
        status_code=app_exc.status_code,
        content={
            "success": False,
            "message": app_exc.message,
            "status_code": app_exc.status_code,
            "error_code": app_exc.error_code
        }
    )

async def generic_exception_handler(
    request:Request,
    exc:Exception
):
    request_id = getattr(request.state, "request_id", None)
    logger.exception(
        "[%s] Unhandled Exception",
        request_id,
        exc_info=exc)

    return JSONResponse(
            status_code=500,
            content={
                "success":False,
                "error_code":"Internal Server Error",
                "message":"Internal Server Error",
                "status_code":500
            }
        )