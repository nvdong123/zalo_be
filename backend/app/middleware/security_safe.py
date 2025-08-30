from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

class SecurityHeadersMiddlewareSafe(BaseHTTPMiddleware):
    """
    Ultra-safe security headers middleware - only adds headers, no blocking checks
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Process request without ANY checks
        response = await call_next(request)
        
        # Add basic security headers
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Disable CSP for docs to avoid Swagger UI issues
        if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
            # No CSP for docs pages - allows all external resources
            pass
        else:
            response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response
