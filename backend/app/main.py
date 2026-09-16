from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import close_database_connection, connect_to_database
from app.routes import admin, auth, business_plan, dashboard, opportunities, scout, subscription

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_database()
    yield
    await close_database_connection()


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered business discovery and execution platform.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # Keep error responses friendly and consistent, never leak internals.
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print(f"[unhandled error] {exc.__class__.__name__}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Something went wrong on our end. Please try again."},
    )


app.include_router(auth.router)
app.include_router(scout.router)
app.include_router(opportunities.router)
app.include_router(business_plan.router)
app.include_router(dashboard.router)
app.include_router(subscription.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "tagline": "From Business Idea to Business Action.",
        "demo_mode": settings.DEMO_MODE,
        "status": "ok",
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy", "demo_mode": settings.DEMO_MODE}
