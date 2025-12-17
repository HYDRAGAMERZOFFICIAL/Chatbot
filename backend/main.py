"""
Entry point of FastAPI server; starts backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.api import chat_api, health
from backend.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION
)

allowed_origins = [
    "http://localhost:8501",
    "http://127.0.0.1:8501",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat_api.router)


@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to Collegewala Chatbot API",
        "api_version": settings.API_VERSION,
        "docs": "/docs",
        "health": "/health/status"
    }


@app.get("/docs", include_in_schema=False)
async def swagger_ui():
    """Swagger UI documentation"""
    return JSONResponse(
        status_code=200,
        content={"message": "API documentation available at /docs"}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle global exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.API_TITLE} v{settings.API_VERSION}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level=settings.LOG_LEVEL.lower()
    )
