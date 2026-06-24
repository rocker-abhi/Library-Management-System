import jwt 
from datetime import datetime, timedelta, timezone
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS

class RefreshTokenHelper:
    
    def __init__(self, secreat_key, algorithm, expires):
        self.__secreat_key = secreat_key
        self.__algorithm = algorithm
        self.__expires = expires
    
    def create_refresh_token(self, user_id: int) -> str:
        now = datetime.now(timezone.utc)
        expires = now + timedelta(minutes=self.__expires)

        payload = {
            "sub": str(user_id),
            "type": "refresh",
            "exp": expires,
            "iat": now
        }
        return jwt.encode(
            payload,
            self.__secreat_key,
            algorithm=self.__algorithm
        )
    
    def __decode_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                self.__secreat_key,
                algorithms=[self.__algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise ApplicationException(error=ERRORS["JWT_TOKEN_006"])
        except jwt.InvalidTokenError:
            raise ApplicationException(error=ERRORS["JWT_TOKEN_007"])
    
    def validate_refresh_token(self, token: str) -> dict:
        payload = self.__decode_token(token)
        if payload.get("type") != "refresh":
            raise ApplicationException(error=ERRORS["JWT_TOKEN_007"])
        return payload
    
    def get_user_id(self, token: str) -> int:
        payload = self.validate_refresh_token(token)
        return int(payload["sub"])