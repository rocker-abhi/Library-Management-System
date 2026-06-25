from operator import imod
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from src.extensions.configurations import settings
# pyrefly: ignore [missing-import]
from src.repository.database_repository import UserRepository
# pyrefly: ignore [missing-import]
from src.utils.password_hasher import verify_password, hash_password
# pyrefly: ignore [missing-import]
from src.extensions.jwt_extension import get_jwt_keys
# pyrefly: ignore [missing-import]
from src.utils.access_token_helper import AccessTokenHelper
# pyrefly: ignore [missing-import]
from src.utils.refresh_token_helper import RefreshTokenHelper
# pyrefly: ignore [missing-import]
from src.extensions.redis_extension import RedisManager
# pyrefly: ignore [missing-import]
from src.redis.factory.redis_factory import RedisFactory
# pyrefly: ignore [missing-import]
from src.redis.enum.redis_store_enums import RedisStoreEnums
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS

import logging
logger = logging.getLogger(__name__)

class AuthService:
    
    def __init__(self, db: Session):
        self.db = db
        
    async def login(self, username, password):
        user_repo = UserRepository(self.db)
        user = user_repo.get_user_by_username(username)
        
        logger.debug("user : %s",user)

        if not user:
            logger.debug("user not found ....")
            raise ApplicationException(ERRORS["AUTH_ERROR_001"])
            
        logger.debug(f"Attempting password verify. username={username}, password_len={len(password)}, secret_key={settings.SECRET_KEY}")
        try:
            verify_password(user.password_hash, f"{password}{settings.SECRET_KEY}")
            logger.debug("Password verified successfully.")
        except Exception as e:
            logger.debug(f"Password verification failed: {e}")
            raise ApplicationException(ERRORS["AUTH_ERROR_001"])
            
        if not user.is_active:
            raise ApplicationException(ERRORS["AUTH_ERROR_002"])
            
        if user.is_password_reset:
            raise ApplicationException(ERRORS["AUTH_ERROR_003"])
            
        # Get JWT configurations
        keys = get_jwt_keys()
        
        access_helper = AccessTokenHelper(
            keys["secret"], 
            keys["algorithm"], 
            keys["access_token_expiration_time"]
        )
        refresh_helper = RefreshTokenHelper(
            keys["secret"], 
            keys["algorithm"], 
            keys["refresh_token_expiration_time"]
        )
        
        # Determine role and permissions
        role_name = user.role.name if user.role else ""
        permissions = [p.name for p in user.role.permissions] if user.role else []
        
        access_token = access_helper.create_access_token(
            user_id=user.id, 
            role=role_name, 
            permissions=permissions
        )
        refresh_token = refresh_helper.create_refresh_token(user_id=user.id)
        
        # Save refresh token in Redis
        redis_client = RedisManager.get_client()
        if redis_client is not None:
            refresh_store = RedisFactory.get_store(
                redis_client, 
                RedisStoreEnums.REFRESH_TOKEN
            )
            await refresh_store.set(str(user.id), refresh_token)
            
        return {
            "success": True,
            "message": "Login successful.",
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_id": str(user.id),
                "role": role_name,
                "permissions": permissions,
                "token_type": "Bearer"
            }
        }

    async def authenticate_me(self,user_id:int):
        user_repo = UserRepository(self.db)
        user = user_repo.get_user_by_id(user_id)
        if not user:
            raise ApplicationException(ERRORS["AUTH_ERROR_004"])
        role_name = user.role.name if user.role else ""
        permissions = [p.name for p in user.role.permissions] if user.role else []
        return {
            "success": True,
            "message": "Authentication successful.",
            "data": {
                "user_id": str(user.id),
                "role": role_name,
                "permissions":permissions,
            }
        }

    async def reset_password(self, username, old_password, new_password):
        user_repo = UserRepository(self.db)
        user = user_repo.get_user_by_username(username)
        if not user:
            raise ApplicationException(ERRORS["AUTH_ERROR_001"])
            
        try:
            verify_password(user.password_hash, f"{old_password}{settings.SECRET_KEY}")
        except Exception:
            raise ApplicationException(ERRORS["AUTH_ERROR_001"])
            
        if not user.is_active:
            raise ApplicationException(ERRORS["AUTH_ERROR_002"])
            
        # Hash new password and disable the reset flag
        hashed_password = hash_password(f"{new_password}{settings.SECRET_KEY}")
        user.password_hash = hashed_password
        user.is_password_reset = False
        self.db.commit()
        
        return {
            "success": True,
            "message": "Password reset successfully. You can now login with your new password."
        }