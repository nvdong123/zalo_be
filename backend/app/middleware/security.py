import logging
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import json
import time

# Configure security logger
security_logger = logging.getLogger("security_logger")
security_logger.setLevel(logging.INFO)

# Create file handler if not exists
if not security_logger.handlers:
    handler = logging.FileHandler("logs/security.log")
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    security_logger.addHandler(handler)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers and perform security checks
    Updated CSP for Swagger UI support
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Perform security validations
        security_check = self._perform_security_checks(request)
        
        if not security_check["allowed"]:
            # Log security violation
            security_logger.warning(f"SECURITY_VIOLATION: {json.dumps(security_check)}")
            
            return JSONResponse(
                status_code=403,
                content={"detail": security_check["reason"]},
                headers=self._get_security_headers(request)
            )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers (with special handling for docs)
        security_headers = self._get_security_headers(request)
        for header, value in security_headers.items():
            response.headers[header] = value
            
        return response
    
    def _perform_security_checks(self, request: Request) -> dict:
        """Perform various security checks"""
        
        # Check request size (prevent DoS)
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
            return {
                "allowed": False,
                "reason": "Request body too large",
                "violation_type": "oversized_request",
                "client_ip": request.client.host if request.client else "unknown",
                "timestamp": time.time()
            }
        
        # Check for suspicious user agents
        user_agent = request.headers.get("user-agent", "").lower()
        suspicious_agents = [
            "sqlmap", "nikto", "nmap", "masscan", "nessus", 
            "openvas", "w3af", "skipfish", "dirb", "gobuster"
        ]
        
        for agent in suspicious_agents:
            if agent in user_agent:
                return {
                    "allowed": False,
                    "reason": "Suspicious user agent detected",
                    "violation_type": "suspicious_user_agent",
                    "user_agent": user_agent,
                    "client_ip": request.client.host if request.client else "unknown",
                    "timestamp": time.time()
                }
        
        # Check for path traversal attempts
        path = str(request.url.path)
        if any(pattern in path for pattern in ["../", "..\\", "%2e%2e", "%252e%252e"]):
            return {
                "allowed": False,
                "reason": "Path traversal attempt detected",
                "violation_type": "path_traversal",
                "path": path,
                "client_ip": request.client.host if request.client else "unknown",
                "timestamp": time.time()
            }
        
        # Check for common attack patterns in headers
        dangerous_headers = request.headers.get("x-forwarded-for", "")
        if any(pattern in dangerous_headers.lower() for pattern in ["<script", "javascript:", "vbscript:"]):
            return {
                "allowed": False,
                "reason": "Malicious header detected",
                "violation_type": "malicious_header",
                "client_ip": request.client.host if request.client else "unknown",
                "timestamp": time.time()
            }
        
        return {"allowed": True}
    
    def _get_security_headers(self, request: Request = None) -> dict:
        """Return security headers to add to response"""
        
        # Relaxed CSP for docs endpoint
        if request and request.url.path in ["/docs", "/redoc"]:
            csp_policy = (
                "default-src 'self' https://cdn.jsdelivr.net; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https: https://cdn.jsdelivr.net; "
                "font-src 'self' https: https://cdn.jsdelivr.net; "
                "connect-src 'self' https://cdn.jsdelivr.net; "
                "frame-ancestors 'none';"
            )
        else:
            # Standard CSP for other endpoints
            csp_policy = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https:; "
                "font-src 'self' https: https://cdn.jsdelivr.net; "
                "connect-src 'self'; "
                "frame-ancestors 'none';"
            )
        
        return {
            # Prevent clickjacking
            "X-Frame-Options": "DENY",
            
            # XSS Protection
            "X-XSS-Protection": "1; mode=block",
            
            # Content Type Options
            "X-Content-Type-Options": "nosniff",
            
            # Referrer Policy
            "Referrer-Policy": "strict-origin-when-cross-origin",
            
            # Content Security Policy
            "Content-Security-Policy": csp_policy,
            
            # HSTS (only in production with HTTPS)
            # "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            
            # Feature Policy
            "Permissions-Policy": (
                "camera=(), microphone=(), geolocation=(), "
                "interest-cohort=(), payment=(), usb=()"
            )
        }


class TenantIsolationMiddleware(BaseHTTPMiddleware):
    """
    Enhanced middleware for tenant isolation and cross-tenant prevention
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip tenant check for public endpoints
        public_endpoints = ["/", "/health", "/docs", "/openapi.json", "/api/v1/login"]
        
        if request.url.path in public_endpoints:
            return await call_next(request)
        
        # Extract tenant information from JWT if available
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                # This will be set by the JWT dependency
                tenant_id = getattr(request.state, 'tenant_id', None)
                user_id = getattr(request.state, 'user_id', None)
                user_role = getattr(request.state, 'user_role', None)
                
                if tenant_id:
                    # Log tenant access
                    tenant_access_log = {
                        "event": "tenant_access",
                        "tenant_id": tenant_id,
                        "user_id": user_id,
                        "user_role": user_role,
                        "endpoint": request.url.path,
                        "method": request.method,
                        "client_ip": request.client.host if request.client else "unknown",
                        "timestamp": time.time()
                    }
                    
                    security_logger.info(f"TENANT_ACCESS: {json.dumps(tenant_access_log)}")
                    
                    # Check for cross-tenant access attempts
                    # This would need to be implemented in the CRUD operations
                    # but we can monitor for suspicious patterns here
                    
            except Exception as e:
                security_logger.error(f"Tenant isolation error: {str(e)}")
        
        response = await call_next(request)
        return response


class RateLimitingMiddleware(BaseHTTPMiddleware):
    """
    Basic rate limiting middleware
    In production, use Redis for distributed rate limiting
    """
    
    def __init__(self, app: ASGIApp, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = {}  # In production, use Redis
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        minute_window = int(current_time // 60)
        
        # Clean old entries
        self._cleanup_old_entries(current_time)
        
        # Check rate limit
        key = f"{client_ip}:{minute_window}"
        request_count = self.requests.get(key, 0)
        
        if request_count >= self.requests_per_minute:
            rate_limit_log = {
                "event": "rate_limit_exceeded",
                "client_ip": client_ip,
                "requests_count": request_count,
                "limit": self.requests_per_minute,
                "endpoint": request.url.path,
                "timestamp": current_time
            }
            
            security_logger.warning(f"RATE_LIMIT_EXCEEDED: {json.dumps(rate_limit_log)}")
            
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded",
                    "retry_after": 60
                },
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(current_time) + 60)
                }
            )
        
        # Increment counter
        self.requests[key] = request_count + 1
        
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = max(0, self.requests_per_minute - (request_count + 1))
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(current_time) + 60)
        
        return response
    
    def _cleanup_old_entries(self, current_time: float):
        """Remove entries older than 2 minutes"""
        current_minute = int(current_time // 60)
        keys_to_remove = []
        
        for key in self.requests:
            minute = int(key.split(':')[1])
            if current_minute - minute > 1:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.requests[key]
