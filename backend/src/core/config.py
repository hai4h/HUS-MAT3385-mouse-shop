from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    # Database settings
    DB_HOST: str = os.getenv("DB_HOST", "mou-x-db.mysql.database.azure.com")
    DB_USER: str = os.getenv("DB_USER", "mouserx")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "123456db!")
    DB_NAME: str = os.getenv("DB_NAME", "mouse_shop")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "2d9c6d3a8a37a7c0f4c7f2e1b5d8e9f6a3c0b9d8e7f4a1d2c5b8a7f4e1d9c6b3a")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    ADMIN_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ADMIN_TOKEN_EXPIRE_MINUTES", "120"))

settings = Settings()

# Export configuration variables
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ADMIN_TOKEN_EXPIRE_MINUTES = settings.ADMIN_TOKEN_EXPIRE_MINUTES