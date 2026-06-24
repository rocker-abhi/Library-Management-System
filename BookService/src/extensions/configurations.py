from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool = False

    JWT_SECREAT_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_TIME: int
    JWT_REFRESH_TOKEN_EXPIRE_TIME: int

    MINIMUM_LOGGIN_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
