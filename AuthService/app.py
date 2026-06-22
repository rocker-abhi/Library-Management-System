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
import logging

setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Setup")

    db.init_db(settings.DATABASE_URL)
    db.check_database_connection()
    logger.info("Database connection established")
    
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
