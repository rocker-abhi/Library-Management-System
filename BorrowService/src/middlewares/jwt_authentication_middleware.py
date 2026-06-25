import logging
import inspect
from functools import wraps
from typing import Dict, Any, Callable
from fastapi import Request

# pyrefly: ignore [missing-import]
from src.extensions.jwt_extension import get_jwt_keys
# pyrefly: ignore [missing-import]
from src.utils.access_token_helper import AccessTokenHelper
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS

logger = logging.getLogger(__name__)


def jwt_required(func):
    """
    Decorator to enforce JWT token validation on sync or async endpoints.
    Requires that the decorated function receives a `Request` object as a parameter.
    Stores the validated user details in `request.state.user`.
    """
    def extract_request(*args, **kwargs) -> Any:
        for arg in args:
            if hasattr(arg, "headers") and hasattr(arg, "state"):
                return arg
        request = kwargs.get("request")
        if request and hasattr(request, "headers") and hasattr(request, "state"):
            return request
        raise ValueError(
            f"Function {func.__name__} must receive a 'request: Request' parameter "
            "to use the @jwt_required decorator."
        )

    def validate_token(request: Request) -> Dict[str, Any]:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise ApplicationException(error=ERRORS["JWT_TOKEN_001"])

        if not auth_header.startswith("Bearer "):
            raise ApplicationException(error=ERRORS["JWT_TOKEN_003"])

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            raise ApplicationException(error=ERRORS["JWT_TOKEN_003"])

        jwt_keys = get_jwt_keys()
        helper = AccessTokenHelper(
            secreat_key=jwt_keys["secret"],
            algorithm=jwt_keys["algorithm"],
            expires=jwt_keys["access_token_expiration_time"]
        )
        payload = helper.validate_access_token(token)

        user_info = {
            "user_id": int(payload["sub"]),
            "role": payload.get("role"),
            "permissions": payload.get("permissions", [])
        }

        # Store in request.state.user
        request.state.user = user_info

        return user_info

    if inspect.iscoroutinefunction(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            request = extract_request(*args, **kwargs)
            validate_token(request)
            return await func(*args, **kwargs)
        return async_wrapper
    else:
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            request = extract_request(*args, **kwargs)
            validate_token(request)
            return func(*args, **kwargs)
        return sync_wrapper
