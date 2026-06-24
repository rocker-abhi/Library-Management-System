import logging
import sys
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(funcName)s:%(lineno)d | %(message)s"

LOG_DIR = "logs"


def setup_logging():
    # Create logs folder
    os.makedirs(LOG_DIR, exist_ok=True)

    today = datetime.now().strftime("%Y-%m-%d")
    error_log_file = os.path.join(LOG_DIR, f"{today}_error.log")

    level_str = os.getenv("MINIMUM_LOGGIN_LEVEL", "INFO").upper()
    log_level = getattr(logging, level_str, logging.INFO)

    logger = logging.getLogger()
    logger.setLevel(log_level)

    formatter = logging.Formatter(LOG_FORMAT)

    # Avoid duplicate handlers (important for FastAPI reload)
    if logger.handlers:
        return

    # -------------------------
    # Console handler (ALL logs)
    # -------------------------
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)

    # -------------------------
    # File handler (ONLY ERRORS)
    # -------------------------
    error_handler = RotatingFileHandler(
        error_log_file,
        maxBytes=10 * 1024 * 1024,
        backupCount=7
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)

    # Attach handlers
    logger.addHandler(console_handler)
    logger.addHandler(error_handler)