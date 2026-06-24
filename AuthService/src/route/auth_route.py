from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from src.validators.login_validator import (LoginRequest, LoginResponse, LoginData)
# pyrefly: ignore [missing-import]
from src.validators.auth_me_validator import AuthMeResponse
# pyrefly: ignore [missing-import]
from src.extensions.database_extension import get_db
# pyrefly: ignore [missing-import]
from src.service.auth_service import AuthService
# pyrefly: ignore [missing-import]
from src.middlewares.jwt_authentication_middleware import jwt_required

from fastapi import Request

auth_route = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@auth_route.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    result = await auth_service.login(payload.username, payload.password)
    return result

@auth_route.get("/me", response_model=AuthMeResponse)
@jwt_required
async def authenticate_me(request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user.get("user_id")
    auth_service = AuthService(db)
    result = await auth_service.authenticate_me(user_id)
    return result

