import jwt 
from datetime import datetime, time, timedelta, timezone
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS

class AccessTokenHelper:
    
    def __init__(self, secreat_key, algorithm, expires):
        self.__secreat_key = secreat_key
        self.__algorithm = algorithm
        self.__expires = expires
    
    def create_access_token(self, user_id:int, role:str, permissions: list[str]) -> str:
        now = datetime.now(timezone.utc)
        expires = now + timedelta(minutes=self.__expires)

        payload = {
            "sub": str(user_id),
            "role": role,
            "permissions": permissions,
            "type":"access",
            "exp": expires,
            "iat": now
        }
        return jwt.encode(
            payload,
            self.__secreat_key,
            algorithm=self.__algorithm
        )
    
    def __decode_token(self, token:str) -> dict:
        try:
            payload = jwt.decode(
                token,
                self.__secreat_key,
                algorithms=[self.__algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise ApplicationException(error=ERRORS["JWT_TOKEN_002"])
        except jwt.InvalidTokenError:
            raise ApplicationException(error=ERRORS["JWT_TOKEN_003"])
    
    def validate_access_token(self, token:str):
        payload = self.__decode_token(token)
        if payload["type"] != "access":
            raise ApplicationException(error=ERRORS["JWT_TOKEN_005"])
        return payload
    
    def get_user_id(self, token:str) -> int:
        payload = self.validate_access_token(token)
        return int(payload["sub"])
    
    def get_role(self, token:str) -> str:
        payload = self.validate_access_token(token)
        return payload["role"]
    
    def get_permissions(self, token:str) -> list[str]:
        payload = self.validate_access_token(token)
        return payload["permissions"]