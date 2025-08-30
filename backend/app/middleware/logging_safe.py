import logging
import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import os

# Configure request logger
request_logger = logging.getLogger("request_logger")
request_logger.setLevel(logging.INFO)

# Create file handler if not exists
if not request_logger.handlers:
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    handler = logging.FileHandler(os.path.join(log_dir, "requests.log"))
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    request_logger.addHandler(handler)

class RequestLoggingMiddlewareSafe(BaseHTTPMiddleware):
    """
    Safe request logging middleware - no request body reading, no blocking operations
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start time
        start_time = time.time()
        
        # Extract basic request information (no body reading)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        method = request.method
        url = str(request.url)
        
        # Log request start
        request_start_data = {
            "request_id": request_id,
            "timestamp": start_time,
            "method": method,
            "url": url,
            "client_ip": client_ip,
            "user_agent": user_agent,
            "event": "request_start"
        }
        
        request_logger.info(f"REQUEST_START: {request_start_data}")
        
        # Process request
        try:
            response = await call_next(request)
            status_code = response.status_code
            success = True
        except Exception as e:
            status_code = 500
            success = False
            request_logger.error(f"REQUEST_ERROR: {request_id} - {str(e)}")
            raise
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Log request completion
        request_end_data = {
            "request_id": request_id,
            "timestamp": time.time(),
            "status_code": status_code,
            "processing_time": processing_time,
            "event": "request_success" if success else "request_error"
        }
        
        request_logger.info(f"REQUEST_{'SUCCESS' if success else 'ERROR'}: {request_end_data}")
        
        # Add request ID to response header
        response.headers["x-request-id"] = request_id
        
        return response
