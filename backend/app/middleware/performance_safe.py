import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import os

# Configure performance logger
performance_logger = logging.getLogger("performance")
performance_logger.setLevel(logging.INFO)

if not performance_logger.handlers:
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    handler = logging.FileHandler(os.path.join(log_dir, "performance.log"))
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    performance_logger.addHandler(handler)

class PerformanceMonitoringMiddlewareSafe(BaseHTTPMiddleware):
    """
    Ultra-safe performance monitoring - only time measurement, no system calls
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.slow_threshold = 2.0  # seconds
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Only measure time - no system metrics
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Log performance data
        performance_data = {
            'timestamp': time.time(),
            'request_id': getattr(request.state, 'request_id', 'unknown'),
            'method': request.method,
            'url': str(request.url),
            'processing_time': processing_time,
            'status_code': response.status_code,
            'client_ip': request.client.host if request.client else "unknown"
        }
        
        # Log all requests
        performance_logger.info(f"PERFORMANCE: {performance_data}")
        
        # Log slow requests separately
        if processing_time > self.slow_threshold:
            performance_logger.warning(f"SLOW_REQUEST: {performance_data}")
        
        return response
