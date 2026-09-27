import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db
from .routers import auth, community, health, insights
from .seed import seed

app = FastAPI(
    title="همراه‌سلامت من — PatientsLikeMe Iran API",
    version="1.0.0",
    description="Patient community, longitudinal health tracking and anonymised aggregate insights.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(community.router)
app.include_router(health.router)
app.include_router(insights.router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    seed()


@app.get("/api/health")
def healthcheck():
    return {"status": "ok"}
