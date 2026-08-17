"""
Main FastAPI application - Security Hardened v8.4.3
"""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.logging import logger
from app.core.security import generate_csp_nonce
from app.core.rate_limit import limiter
from app.core.upload_limit import UploadSizeLimitMiddleware
from app.api.metrics import record_request
from app.api import auth, users, sales, contracts, crm, svetlana, websocket
from app.api import subscriptions, flutter, email_campaigns, analytics
from app.api import import_export, search, calendar, notifications, webrtc
from app.api import ai_analytics, white_label, mfa, telegram_bot, api_keys
from app.api import webhooks, whatsapp, reports, backups, health, admin
from app.api import referrals, tasks, export, import_data, accounting, fns, bank, metrics
from app.html_routes import router as html_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    if settings.ENVIRONMENT == "production":
        if len(settings.SECRET_KEY) < 32:
            raise RuntimeError("SECRET_KEY must be at least 32 characters in production")
        if not settings.BANK_ENCRYPTION_KEY:
            raise RuntimeError("BANK_ENCRYPTION_KEY is required in production")
    if settings.ENVIRONMENT != "production":
        await init_db()
    yield
    await close_db()
    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Platform for self-employed",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"}))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, f"https://{settings.DOMAIN}"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token", "X-Client-Type", "Idempotency-Key", "Accept"],
    max_age=600,
)

_allowed_hosts = [settings.DOMAIN, f"*.{settings.DOMAIN}"]
if settings.ENVIRONMENT != "production":
    _allowed_hosts.extend(["localhost", "127.0.0.1"])
app.add_middleware(TrustedHostMiddleware, allowed_hosts=_allowed_hosts)
app.add_middleware(UploadSizeLimitMiddleware)


@app.middleware("http")
async def csrf_protection(request: Request, call_next):
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and request.url.path == "/api/auth/refresh":
        if request.headers.get("X-Client-Type", "").lower() not in {"mobile", "flutter"}:
            import hmac
            csrf_cookie = request.cookies.get("csrf_token")
            csrf_header = request.headers.get("X-CSRF-Token")
            if not csrf_cookie or not csrf_header or not hmac.compare_digest(csrf_cookie, csrf_header):
                return JSONResponse(status_code=403, content={"detail": "CSRF token required"})
    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    nonce = generate_csp_nonce()
    request.state.csp_nonce = nonce
    start_time = time.time()
    response = await call_next(request)
    duration = (time.time() - start_time) * 1000
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    csp = (
        f"default-src 'self'; script-src 'self' 'nonce-{nonce}'; "
        f"style-src 'self' 'nonce-{nonce}' https://fonts.googleapis.com; "
        f"font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; "
        f"connect-src 'self' https://api.openrouter.ai https://api.yookassa.ru; "
        f"frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    )
    response.headers["Content-Security-Policy"] = csp
    response.headers["X-Response-Time"] = f"{duration:.2f}ms"
    return response


@app.middleware("http")
async def request_logging(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        duration = (time.time() - start_time) * 1000
        record_request(response.status_code, duration / 1000.0)
        logger.info(f"{request.method} {request.url.path} {response.status_code} {duration:.2f}ms")
        return response
    except Exception:
        logger.exception(f"{request.method} {request.url.path} ERROR")
        raise


for router in [auth, users, sales, contracts, crm, svetlana, websocket, subscriptions, flutter,
               email_campaigns, analytics, import_export, search, calendar, notifications, webrtc,
               ai_analytics, white_label, mfa, telegram_bot, api_keys, webhooks, whatsapp, reports,
               backups, health, admin, referrals, tasks, export, import_data, accounting, fns, bank, metrics]:
    app.include_router(router.router)
app.include_router(html_router)


@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running", "environment": settings.ENVIRONMENT}
