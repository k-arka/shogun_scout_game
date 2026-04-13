"""
FastAPI application entrypoint for Shogun's Scout backend.
Runs on http://localhost:8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.db import init_db
from backend.api.routes import router

app = FastAPI(
    title="Shogun's Scout API",
    description="Backend for the Samurai-themed browser RPG scavenger hunt.",
    version="1.0.0",
)

# Allow the Next.js dev server (port 3000) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "shogun-scout-api"}
