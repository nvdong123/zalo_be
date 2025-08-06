import logging
import time
import json
from typing import Callable, Dict, Any
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from sqlalchemy.orm import Session
from app.db.session import get_db

# Configure audit logger
audit_logger = logging.getLogger("audit_logger")
audit_logger.setLevel(logging.INFO)

# Create file handler if not exists
if not audit_logger.handlers:
    handler = logging.FileHandler("logs/audit.log")
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    audit_logger.addHandler(handler)

class AuditTrailMiddleware(BaseHTTPMiddleware):
    """
    Middleware to create comprehensive audit trails for all operations
    Tracks all CRUD operations, authentication events, and data access
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip audit for non-sensitive endpoints
        skip_audit = ["/health", "/docs", "/openapi.json", "/favicon.ico"]
        
        if request.url.path in skip_audit:
            return await call_next(request)
        
        # Capture request details
        audit_data = await self._capture_request_data(request)
        
        # Process request
        start_time = time.time()
        response = await call_next(request)
        processing_time = time.time() - start_time
        
        # Capture response details
        audit_data.update(await self._capture_response_data(response, processing_time))
        
        # Determine audit event type
        event_type = self._determine_event_type(request, response)
        audit_data["event_type"] = event_type
        
        # Log audit event
        self._log_audit_event(audit_data)
        
        # Store audit in database for critical operations
        if self._is_critical_operation(request, response):
            await self._store_audit_in_db(audit_data)
        
        return response
    
    async def _capture_request_data(self, request: Request) -> Dict[str, Any]:
        """Capture comprehensive request data for audit"""
        
        # Extract user context
        user_id = getattr(request.state, 'user_id', None)
        tenant_id = getattr(request.state, 'tenant_id', None)
        user_role = getattr(request.state, 'user_role', None)
        user_email = getattr(request.state, 'user_email', None)
        
        # Capture request body for write operations (be careful with sensitive data)
        request_body = None
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            try:
                # For audit purposes, capture sanitized request data
                request_body = await self._sanitize_request_body(request)
            except:
                request_body = "Unable to capture request body"
        
        return {
            "timestamp": time.time(),
            "request_id": getattr(request.state, 'request_id', 'unknown'),
            "user_id": user_id,
            "tenant_id": tenant_id,
            "user_role": user_role,
            "user_email": user_email,
            "method": request.method,
            "endpoint": request.url.path,
            "query_params": dict(request.query_params),
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
            "request_body": request_body,
            "headers": dict(request.headers)
        }
    
    async def _capture_response_data(self, response: Response, processing_time: float) -> Dict[str, Any]:
        """Capture response data for audit"""
        
        return {
            "status_code": response.status_code,
            "processing_time": processing_time,
            "response_headers": dict(response.headers)
        }
    
    def _determine_event_type(self, request: Request, response: Response) -> str:
        """Determine the type of audit event"""
        
        # Authentication events
        if "/login" in request.url.path:
            if response.status_code == 200:
                return "authentication_success"
            else:
                return "authentication_failure"
        
        if "/logout" in request.url.path:
            return "authentication_logout"
        
        # Data operations
        if request.method == "POST":
            if response.status_code in [200, 201]:
                return "data_create"
            else:
                return "data_create_failed"
        
        elif request.method == "PUT":
            if response.status_code == 200:
                return "data_update"
            else:
                return "data_update_failed"
        
        elif request.method == "DELETE":
            if response.status_code in [200, 204]:
                return "data_delete"
            else:
                return "data_delete_failed"
        
        elif request.method == "GET":
            if response.status_code == 200:
                return "data_access"
            else:
                return "data_access_failed"
        
        # Administrative operations
        if "/admin" in request.url.path:
            return "admin_operation"
        
        # Tenant operations
        if "/tenants" in request.url.path:
            return "tenant_operation"
        
        return "general_operation"
    
    def _is_critical_operation(self, request: Request, response: Response) -> bool:
        """Determine if operation should be stored in database"""
        
        critical_paths = [
            "/login", "/logout", "/admin", "/tenants",
            "/users", "/roles", "/permissions"
        ]
        
        critical_methods = ["POST", "PUT", "DELETE"]
        
        return (
            any(path in request.url.path for path in critical_paths) or
            request.method in critical_methods or
            response.status_code >= 400
        )
    
    async def _sanitize_request_body(self, request: Request) -> Dict[str, Any]:
        """Sanitize request body for audit logging (remove sensitive data)"""
        
        try:
            body = await request.body()
            if not body:
                return None
            
            # Parse JSON if possible
            try:
                data = json.loads(body)
                
                # Remove sensitive fields
                sensitive_fields = [
                    "password", "token", "secret", "key", "credit_card",
                    "ssn", "social_security", "bank_account"
                ]
                
                if isinstance(data, dict):
                    sanitized = {}
                    for key, value in data.items():
                        if any(field in key.lower() for field in sensitive_fields):
                            sanitized[key] = "[REDACTED]"
                        else:
                            sanitized[key] = value
                    return sanitized
                
                return data
                
            except json.JSONDecodeError:
                return f"Non-JSON body: {len(body)} bytes"
                
        except Exception as e:
            return f"Error parsing body: {str(e)}"
    
    def _log_audit_event(self, audit_data: Dict[str, Any]):
        """Log audit event to file"""
        
        audit_logger.info(f"AUDIT_EVENT: {json.dumps(audit_data, default=str)}")
    
    async def _store_audit_in_db(self, audit_data: Dict[str, Any]):
        """Store critical audit events in database"""
        
        try:
            # In a real implementation, you would create an AuditLog model
            # and store the audit data in the database
            # For now, we'll just log that we would store it
            
            audit_logger.info(f"CRITICAL_AUDIT_DB_STORE: {json.dumps(audit_data, default=str)}")
            
            # Example implementation:
            # db = next(get_db())
            # audit_log = AuditLog(
            #     user_id=audit_data.get('user_id'),
            #     tenant_id=audit_data.get('tenant_id'),
            #     event_type=audit_data.get('event_type'),
            #     endpoint=audit_data.get('endpoint'),
            #     method=audit_data.get('method'),
            #     status_code=audit_data.get('status_code'),
            #     details=json.dumps(audit_data),
            #     created_at=datetime.utcnow()
            # )
            # db.add(audit_log)
            # db.commit()
            
        except Exception as e:
            audit_logger.error(f"Failed to store audit in database: {str(e)}")


class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """
    Middleware to monitor API performance and detect issues
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.performance_logger = logging.getLogger("performance_logger")
        
        # Create file handler if not exists
        if not self.performance_logger.handlers:
            handler = logging.FileHandler("logs/performance.log")
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.performance_logger.addHandler(handler)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Monitor memory usage (basic implementation)
        import psutil
        process = psutil.Process()
        memory_before = process.memory_info().rss / 1024 / 1024  # MB
        
        response = await call_next(request)
        
        end_time = time.time()
        processing_time = end_time - start_time
        memory_after = process.memory_info().rss / 1024 / 1024  # MB
        memory_used = memory_after - memory_before
        
        # Log performance metrics
        performance_data = {
            "timestamp": start_time,
            "endpoint": request.url.path,
            "method": request.method,
            "status_code": response.status_code,
            "processing_time": processing_time,
            "memory_before_mb": memory_before,
            "memory_after_mb": memory_after,
            "memory_used_mb": memory_used,
            "tenant_id": getattr(request.state, 'tenant_id', None),
            "user_id": getattr(request.state, 'user_id', None)
        }
        
        # Log performance
        self.performance_logger.info(f"PERFORMANCE: {json.dumps(performance_data)}")
        
        # Alert on slow requests
        if processing_time > 5.0:  # 5 seconds
            slow_request_alert = {
                "alert_type": "slow_request",
                "processing_time": processing_time,
                "endpoint": request.url.path,
                "method": request.method,
                "timestamp": start_time,
                "severity": "high" if processing_time > 10.0 else "medium"
            }
            
            self.performance_logger.warning(f"SLOW_REQUEST_ALERT: {json.dumps(slow_request_alert)}")
        
        # Alert on high memory usage
        if memory_used > 100:  # 100MB
            memory_alert = {
                "alert_type": "high_memory_usage",
                "memory_used_mb": memory_used,
                "endpoint": request.url.path,
                "method": request.method,
                "timestamp": start_time,
                "severity": "high" if memory_used > 500 else "medium"
            }
            
            self.performance_logger.warning(f"MEMORY_ALERT: {json.dumps(memory_alert)}")
        
        # Add performance headers
        response.headers["X-Processing-Time"] = str(processing_time)
        response.headers["X-Memory-Used"] = str(memory_used)
        
        return response
