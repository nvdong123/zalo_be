import logging
import time
import uuid
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import json

# Configure request logger
request_logger = logging.getLogger("request_logger")
request_logger.setLevel(logging.INFO)

# Create file handler if not exists
if not request_logger.handlers:
    handler = logging.FileHandler("logs/requests.log")
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    request_logger.addHandler(handler)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests and responses
    Includes security monitoring and audit trail
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start time
        start_time = time.time()
        
        # Extract request information
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        method = request.method
        url = str(request.url)
        
        # Extract user info if authenticated
        user_info = "anonymous"
        tenant_id = "unknown"
        
        # Try to get user from JWT token
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                # This would be populated by the auth dependency
                user_info = getattr(request.state, 'current_user', 'authenticated')
                tenant_id = getattr(request.state, 'tenant_id', 'unknown')
            except:
                pass
        
        # Log request start
        request_log = {
            "request_id": request_id,
            "timestamp": time.time(),
            "method": method,
            "url": url,
            "client_ip": client_ip,
            "user_agent": user_agent,
            "user_info": user_info,
            "tenant_id": tenant_id,
            "headers": dict(request.headers),
            "event": "request_start"
        }
        
        request_logger.info(f"REQUEST_START: {json.dumps(request_log)}")
        
        # Security monitoring - detect suspicious patterns
        self._security_monitoring(request, client_ip, user_agent, method, url)
        
        # Process request
        try:
            response = await call_next(request)
            processing_time = time.time() - start_time
            
            # Log successful response
            response_log = {
                "request_id": request_id,
                "timestamp": time.time(),
                "status_code": response.status_code,
                "processing_time": processing_time,
                "user_info": user_info,
                "tenant_id": tenant_id,
                "event": "request_success"
            }
            
            request_logger.info(f"REQUEST_SUCCESS: {json.dumps(response_log)}")
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            processing_time = time.time() - start_time
            
            # Log error
            error_log = {
                "request_id": request_id,
                "timestamp": time.time(),
                "error": str(e),
                "processing_time": processing_time,
                "user_info": user_info,
                "tenant_id": tenant_id,
                "event": "request_error"
            }
            
            request_logger.error(f"REQUEST_ERROR: {json.dumps(error_log)}")
            
            # Return error response
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error", "request_id": request_id}
            )
    
    def _security_monitoring(self, request: Request, client_ip: str, user_agent: str, method: str, url: str):
        """Monitor for suspicious activities"""
        
        # SQL Injection patterns
        suspicious_patterns = [
            "union select", "drop table", "insert into", "delete from",
            "<script>", "javascript:", "onload=", "onerror=",
            "../", "..\\", "etc/passwd", "cmd.exe"
        ]
        
        # Check URL and query parameters
        full_url = str(request.url).lower()
        for pattern in suspicious_patterns:
            if pattern in full_url:
                security_alert = {
                    "alert_type": "suspicious_pattern",
                    "pattern": pattern,
                    "client_ip": client_ip,
                    "user_agent": user_agent,
                    "url": url,
                    "timestamp": time.time(),
                    "severity": "high"
                }
                request_logger.warning(f"SECURITY_ALERT: {json.dumps(security_alert)}")
        
        # Rate limiting monitoring (basic)
        # In production, you'd use Redis for this
        rate_limit_key = f"rate_limit:{client_ip}"
        
        # Monitor for excessive requests from same IP
        # This is a basic implementation - use Redis in production
        
        # Brute force detection
        if method == "POST" and "/login" in url:
            brute_force_alert = {
                "alert_type": "potential_brute_force",
                "client_ip": client_ip,
                "user_agent": user_agent,
                "timestamp": time.time(),
                "severity": "medium"
            }
            request_logger.warning(f"SECURITY_ALERT: {json.dumps(brute_force_alert)}")
