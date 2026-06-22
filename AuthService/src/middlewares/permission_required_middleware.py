import logging
import inspect
from functools import wraps
from typing import Dict, Any, Callable
from fastapi import Request

# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS

logger = logging.getLogger(__name__)

def permission_required(*permissions: str):
    """
    Decorator to enforce that the authenticated user possesses all specified permissions.
    Expects that a JWT authentication step (like @jwt_required) has run and stored 
    the validated user info in `request.state.user`.
    Supports both sync and async functions.
    """
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        def extract_request(*args, **kwargs) -> Any:
            for arg in args:
                if hasattr(arg, "headers") and hasattr(arg, "state"):
                    return arg
            request = kwargs.get("request")
            if request and hasattr(request, "headers") and hasattr(request, "state"):
                return request
            raise ValueError(
                f"Function {func.__name__} must receive a 'request: Request' parameter "
                "to use the @permission_required decorator."
            )

        def check_permissions(request: Request):
            user = getattr(request.state, "user", None)
            if not user:
                # User is unauthenticated (missing or failed JWT authentication)
                raise ApplicationException(error=ERRORS["JWT_TOKEN_001"])
            
            user_perms = user.get("permissions", [])
            # Check if all required permissions are met
            if not all(p in user_perms for p in permissions):
                raise ApplicationException(error={
                    "status_code": 403,
                    "error_code": "PERMISSION_DENIED",
                    "message": "Access denied. Missing required permissions."
                })

        if inspect.iscoroutinefunction(func):
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                request = extract_request(*args, **kwargs)
                check_permissions(request)
                return await func(*args, **kwargs)
            return async_wrapper
        else:
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                request = extract_request(*args, **kwargs)
                check_permissions(request)
                return func(*args, **kwargs)
            return sync_wrapper

    return decorator
