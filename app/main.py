from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.database import engine, Base
from app.routers import auth, project, users, documents, chat, vector, settings as settings_router

from app.models import user, project as project_model, document as document_model, chat as chat_model, chunk as chunk_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up Research Assistant API...")
    os.makedirs("uploads", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    print("Database tables ready")
    yield
    print("Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(project.router)
app.include_router(documents.router)
app.include_router(documents.global_router)
app.include_router(chat.router)
app.include_router(vector.router)
app.include_router(settings_router.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "running",
        "app": settings.APP_NAME,
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}