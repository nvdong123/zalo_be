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
        
        # Temporarily disable all CSP for debugging
        # if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
        #     # No CSP for docs pages - allows all external resources
        #     print(f"DEBUG: Docs page {request.url.path} - No CSP added")
        #     pass
        # else:
        #     response.headers["Content-Security-Policy"] = "default-src 'self'"
        #     print(f"DEBUG: Regular page {request.url.path} - CSP added")
        
        # No CSP at all for now
        print(f"DEBUG: No CSP for {request.url.path}")
        
        return response
