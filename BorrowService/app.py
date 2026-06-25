from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
load_dotenv()

# pyrefly: ignore [missing-import]
from src.extensions.configurations import settings
# pyrefly: ignore [missing-import]
from src.extensions.logger_extension import setup_logging
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

# pyrefly: ignore [missing-import]
from src.extensions import database_extension as db

# pyrefly: ignore [missing-import]
from src.middlewares.request_middleware import RequestContextMiddleware

# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import app_exception_handler, generic_exception_handler, ApplicationException

# pyrefly: ignore [missing-import]
from src.extensions.jwt_extension import setup_jwt_manager

import logging

setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Setup")

    db.init_db(settings.DATABASE_URL)
    db.check_database_connection()
    logger.info("Database connection established")

    setup_jwt_manager(
        settings.JWT_SECREAT_KEY,
        settings.JWT_ALGORITHM,
        settings.JWT_ACCESS_TOKEN_EXPIRE_TIME,
        settings.JWT_REFRESH_TOKEN_EXPIRE_TIME
    )
    logger.info("JWT manager setup")
    
    yield
    #shutdown
    logger.info("Shutting down application .")


def init_app():
    app = FastAPI(lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)
    app.add_exception_handler(ApplicationException, app_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    return app

app =  init_app()


# ------------------------------------------------------------------
# Health Endpoints
# ------------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "System is up and running"
    }

@app.get("/version")
async def version():
    return {
        "version": "1.0.0"
    }

@app.get("/ready")
async def ready_check():
    try:
        db.check_database_connection()
        return {
            "status": "ok",
            "message": "System is ready to serve traffic"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
