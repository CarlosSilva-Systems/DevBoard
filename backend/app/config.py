from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://postgres:password@127.0.0.1:5433/devboard"
    SECRET_KEY: str = "devboard_secret_key_change_me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200 # 30 days for MVP convenience
    
    # GitHub OAuth
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/integrations/github/callback"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
