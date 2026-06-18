import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.payments import router as payments_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AEVRO API",
    version="1.0.0",
    description="Backend API for AEVRO clothing brand",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(payments_router)


@app.get("/health")
def health_check():
    """Root health check endpoint."""
    return {"status": "ok", "env": settings.APP_ENV}


@app.on_event("startup")
def on_startup():
    logger.info("AEVRO API started successfully")
