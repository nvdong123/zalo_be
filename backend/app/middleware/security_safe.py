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
        
        # Enhanced CSP for docs compatibility
        if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
            csp_docs = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://fastapi.tiangolo.com https://cdn.jsdelivr.net; "
                "font-src 'self' https://cdn.jsdelivr.net; "
                "connect-src 'self'"
            )
            response.headers["Content-Security-Policy"] = csp_docs
        else:
            response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response
