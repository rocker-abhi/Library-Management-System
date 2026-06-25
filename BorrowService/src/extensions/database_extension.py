from typing import final
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text


class PostgresDatabase:

    def __init__(self, uri: str):

        self.engine = create_engine(
            uri,
            pool_pre_ping=True,
            pool_size=20,
            max_overflow=10,
            pool_recycle=3600,
            echo=False,
        )

        self.SessionLocal = sessionmaker(
            bind=self.engine,
            autocommit=False,
            autoflush=False,
        )

    def get_session(self):
        db = self.SessionLocal()

        try:
            yield db
        finally:
            db.close()
    
    def check_database_connection(self):
        try:
            with self.engine.connect() as conn :
                conn.execute(text("SELECT 1"))
        except Exception as e:
            raise Exception("Unable to connect to database")

postgres_database = None

def init_db(uri: str):
    global postgres_database
    postgres_database = PostgresDatabase(uri)

def get_db():
    if postgres_database is None:
        raise RuntimeError("Database is not initialized")
    yield from postgres_database.get_session()

def check_database_connection():
    global postgres_database
    if postgres_database is None :
        raise RuntimeError("Database is not initialized")
    postgres_database.check_database_connection()