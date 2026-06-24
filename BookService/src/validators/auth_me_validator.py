from pydantic import BaseModel
from typing import List

class AuthMeData(BaseModel):
    user_id: str
    role: str
    permissions: List[str]

class AuthMeResponse(BaseModel):
    success: bool
    message: str
    data: AuthMeData
