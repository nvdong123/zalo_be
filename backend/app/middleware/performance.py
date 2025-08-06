import time
import psutil
import logging
from typing import Dict, Any
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Import monitoring components
from app.core.error_handling import system_monitor

logger = logging.getLogger(__name__)

class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """
    Performance monitoring middleware for tracking response times,
    resource usage, and system performance metrics
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.performance_logger = logging.getLogger("performance")
        
        # Create file handler if not exists
        if not self.performance_logger.handlers:
            handler = logging.FileHandler("logs/performance.log")
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.performance_logger.addHandler(handler)
        
        # Performance thresholds
        self.slow_request_threshold = 2.0  # seconds
        self.memory_warning_threshold = 80  # percentage
        self.cpu_warning_threshold = 80     # percentage
        
        # Metrics tracking
        self.request_count = 0
        self.total_response_time = 0.0
        self.slow_requests = []
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request and monitor performance"""
        
        start_time = time.time()
        
        # Get initial system metrics
        initial_memory = psutil.virtual_memory().percent
        initial_cpu = psutil.cpu_percent()
        
        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log performance data even for failed requests
            processing_time = time.time() - start_time
            await self._log_performance_data(request, processing_time, 500, initial_memory, initial_cpu)
            raise e
        
        # Calculate performance metrics
        processing_time = time.time() - start_time
        final_memory = psutil.virtual_memory().percent
        final_cpu = psutil.cpu_percent()
        
        # Log performance data
        await self._log_performance_data(
            request, processing_time, response.status_code,
            initial_memory, initial_cpu, final_memory, final_cpu
        )
        
        # Check for performance issues
        await self._check_performance_thresholds(
            request, processing_time, final_memory, final_cpu
        )
        
        return response
    
    async def _log_performance_data(
        self, 
        request: Request, 
        processing_time: float, 
        status_code: int,
        initial_memory: float, 
        initial_cpu: float,
        final_memory: float = None, 
        final_cpu: float = None
    ):
        """Log detailed performance metrics"""
        
        # Update internal metrics
        self.request_count += 1
        self.total_response_time += processing_time
        
        # Get request details
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        method = request.method
        url = str(request.url)
        
        # Create performance record
        performance_data = {
            "timestamp": time.time(),
            "request_id": getattr(request.state, 'request_id', 'unknown'),
            "method": method,
            "url": url,
            "client_ip": client_ip,
            "user_agent": user_agent,
            "processing_time": processing_time,
            "status_code": status_code,
            "initial_memory_percent": initial_memory,
            "initial_cpu_percent": initial_cpu,
            "final_memory_percent": final_memory,
            "final_cpu_percent": final_cpu,
            "memory_usage_change": final_memory - initial_memory if final_memory else 0,
            "cpu_usage_change": final_cpu - initial_cpu if final_cpu else 0
        }
        
        # Log performance data
        self.performance_logger.info(f"PERFORMANCE: {performance_data}")
        
        # Track slow requests
        if processing_time > self.slow_request_threshold:
            self.slow_requests.append({
                "url": url,
                "method": method,
                "processing_time": processing_time,
                "timestamp": time.time()
            })
            
            # Keep only last 100 slow requests
            if len(self.slow_requests) > 100:
                self.slow_requests = self.slow_requests[-100:]
    
    async def _check_performance_thresholds(
        self, 
        request: Request, 
        processing_time: float, 
        memory_percent: float, 
        cpu_percent: float
    ):
        """Check performance thresholds and trigger alerts if needed"""
        
        # Check slow request threshold
        if processing_time > self.slow_request_threshold:
            system_monitor.alert_system.trigger_alert(
                alert_type="slow_request",
                message=f"Slow request detected: {request.method} {request.url} took {processing_time:.2f}s",
                severity="medium",
                metadata={
                    "url": str(request.url),
                    "method": request.method,
                    "processing_time": processing_time,
                    "threshold": self.slow_request_threshold
                }
            )
        
        # Check memory usage threshold
        if memory_percent > self.memory_warning_threshold:
            system_monitor.alert_system.trigger_alert(
                alert_type="high_memory_usage",
                message=f"High memory usage detected: {memory_percent:.1f}%",
                severity="high" if memory_percent > 90 else "medium",
                metadata={
                    "memory_percent": memory_percent,
                    "threshold": self.memory_warning_threshold
                }
            )
        
        # Check CPU usage threshold
        if cpu_percent > self.cpu_warning_threshold:
            system_monitor.alert_system.trigger_alert(
                alert_type="high_cpu_usage",
                message=f"High CPU usage detected: {cpu_percent:.1f}%",
                severity="high" if cpu_percent > 90 else "medium",
                metadata={
                    "cpu_percent": cpu_percent,
                    "threshold": self.cpu_warning_threshold
                }
            )
    
    def get_performance_statistics(self) -> Dict[str, Any]:
        """Get current performance statistics"""
        
        avg_response_time = (
            self.total_response_time / self.request_count 
            if self.request_count > 0 else 0
        )
        
        # Get current system metrics
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent()
        disk = psutil.disk_usage('/')
        
        return {
            "requests_processed": self.request_count,
            "average_response_time": avg_response_time,
            "slow_requests_count": len(self.slow_requests),
            "recent_slow_requests": self.slow_requests[-10:] if self.slow_requests else [],
            "system_metrics": {
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                    "used": memory.used,
                    "free": memory.free
                },
                "cpu": {
                    "percent": cpu_percent,
                    "count": psutil.cpu_count()
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": (disk.used / disk.total) * 100
                }
            },
            "thresholds": {
                "slow_request_threshold": self.slow_request_threshold,
                "memory_warning_threshold": self.memory_warning_threshold,
                "cpu_warning_threshold": self.cpu_warning_threshold
            }
        }
    
    def reset_statistics(self):
        """Reset performance statistics"""
        self.request_count = 0
        self.total_response_time = 0.0
        self.slow_requests = []


class ResourceMonitor:
    """
    Resource monitoring utilities for system health
    """
    
    @staticmethod
    def get_system_resources() -> Dict[str, Any]:
        """Get comprehensive system resource information"""
        
        # Memory information
        memory = psutil.virtual_memory()
        
        # CPU information
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        # Disk information
        disk = psutil.disk_usage('/')
        
        # Network information (if available)
        try:
            network = psutil.net_io_counters()
            network_info = {
                "bytes_sent": network.bytes_sent,
                "bytes_recv": network.bytes_recv,
                "packets_sent": network.packets_sent,
                "packets_recv": network.packets_recv
            }
        except:
            network_info = {"error": "Network stats not available"}
        
        # Process information
        try:
            process = psutil.Process()
            process_info = {
                "pid": process.pid,
                "memory_percent": process.memory_percent(),
                "cpu_percent": process.cpu_percent(),
                "num_threads": process.num_threads(),
                "create_time": process.create_time()
            }
        except:
            process_info = {"error": "Process stats not available"}
        
        return {
            "timestamp": time.time(),
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used,
                "free": memory.free,
                "buffers": getattr(memory, 'buffers', 0),
                "cached": getattr(memory, 'cached', 0)
            },
            "cpu": {
                "percent": cpu_percent,
                "count": cpu_count,
                "frequency": {
                    "current": cpu_freq.current if cpu_freq else 0,
                    "min": cpu_freq.min if cpu_freq else 0,
                    "max": cpu_freq.max if cpu_freq else 0
                }
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": (disk.used / disk.total) * 100
            },
            "network": network_info,
            "process": process_info,
            "boot_time": psutil.boot_time(),
            "load_average": getattr(psutil, 'getloadavg', lambda: [0, 0, 0])()
        }
    
    @staticmethod
    def check_resource_health() -> Dict[str, Any]:
        """Check system resource health status"""
        
        resources = ResourceMonitor.get_system_resources()
        
        # Define health thresholds
        thresholds = {
            "memory_critical": 95,
            "memory_warning": 80,
            "cpu_critical": 95,
            "cpu_warning": 80,
            "disk_critical": 95,
            "disk_warning": 85
        }
        
        health_status = "healthy"
        issues = []
        
        # Check memory
        memory_percent = resources["memory"]["percent"]
        if memory_percent >= thresholds["memory_critical"]:
            health_status = "critical"
            issues.append(f"Critical memory usage: {memory_percent:.1f}%")
        elif memory_percent >= thresholds["memory_warning"]:
            if health_status == "healthy":
                health_status = "warning"
            issues.append(f"High memory usage: {memory_percent:.1f}%")
        
        # Check CPU
        cpu_percent = resources["cpu"]["percent"]
        if cpu_percent >= thresholds["cpu_critical"]:
            health_status = "critical"
            issues.append(f"Critical CPU usage: {cpu_percent:.1f}%")
        elif cpu_percent >= thresholds["cpu_warning"]:
            if health_status == "healthy":
                health_status = "warning"
            issues.append(f"High CPU usage: {cpu_percent:.1f}%")
        
        # Check disk
        disk_percent = resources["disk"]["percent"]
        if disk_percent >= thresholds["disk_critical"]:
            health_status = "critical"
            issues.append(f"Critical disk usage: {disk_percent:.1f}%")
        elif disk_percent >= thresholds["disk_warning"]:
            if health_status == "healthy":
                health_status = "warning"
            issues.append(f"High disk usage: {disk_percent:.1f}%")
        
        return {
            "status": health_status,
            "issues": issues,
            "resources": resources,
            "thresholds": thresholds
        }
