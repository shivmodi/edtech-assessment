from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://admin:admin123@localhost:5432/edtech"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
