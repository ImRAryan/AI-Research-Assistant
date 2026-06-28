from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):

    FRONTEND_URL: str = "http://localhost:5173"
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    APP_NAME: str
    DEBUG: bool
    ALLOWED_ORIGINS: str

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""

    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = ""

    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""

    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()