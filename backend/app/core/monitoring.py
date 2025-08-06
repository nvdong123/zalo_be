from typing import Generator, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging
import time
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

class HealthChecker:
    """
    Comprehensive health checking system
    """
    
    def __init__(self):
        pass
    
    async def check_health(self) -> dict:
        """Main health check method"""
        try:
            database_health = self.check_database_health()
            system_health = self.check_system_resources()
            
            # Determine overall status
            if database_health["status"] == "healthy" and system_health["status"] == "healthy":
                overall_status = "healthy"
            elif database_health["status"] == "unhealthy" or system_health["status"] == "unhealthy":
                overall_status = "unhealthy"
            else:
                overall_status = "degraded"
            
            return {
                "status": overall_status,
                "timestamp": time.time(),
                "database": database_health,
                "system": system_health
            }
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": time.time()
            }
    
    async def detailed_health_check(self) -> dict:
        """Detailed health check with all components"""
        database_health = self.check_database_health()
        system_health = self.check_system_resources()
        auth_health = self.check_authentication_service()
        
        # Determine overall status
        statuses = [database_health["status"], system_health["status"], auth_health["status"]]
        if all(status == "healthy" for status in statuses):
            overall_status = "healthy"
        elif any(status == "unhealthy" for status in statuses):
            overall_status = "unhealthy"
        else:
            overall_status = "degraded"
        
        return {
            "status": overall_status,
            "timestamp": time.time(),
            "services": {
                "database": database_health,
                "system": system_health,
                "authentication": auth_health
            }
        }
    
    def check_database_health(self) -> dict:
        """Check database connectivity and performance"""
        try:
            db: Session = SessionLocal()
            
            # Test basic connectivity
            start_time = time.time()
            result = db.execute(text("SELECT 1"))
            connection_time = time.time() - start_time
            
            # Test table existence (for SQLite compatibility)
            try:
                tenant_check = db.execute(text("SELECT COUNT(*) FROM TblTenants"))
                tenant_count = tenant_check.scalar()
            except Exception:
                # If TblTenants doesn't exist, just set count to 0
                tenant_count = 0
            
            db.close()
            
            status = "healthy" if connection_time < 1.0 else "degraded"
            
            return {
                "status": status,
                "connection_time": connection_time,
                "tenant_count": tenant_count,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": time.time()
            }
    
    def check_system_resources(self) -> dict:
        """Check system resource usage"""
        try:
            import psutil
            
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            # Determine overall status
            status = "healthy"
            if cpu_percent > 80 or memory_percent > 80 or disk_percent > 80:
                status = "degraded"
            if cpu_percent > 95 or memory_percent > 95 or disk_percent > 95:
                status = "critical"
            
            return {
                "status": status,
                "cpu_percent": cpu_percent,
                "memory_percent": memory_percent,
                "disk_percent": disk_percent,
                "timestamp": time.time()
            }
            
        except ImportError:
            return {
                "status": "unknown",
                "error": "psutil not available",
                "timestamp": time.time()
            }
        except Exception as e:
            logger.error(f"System resource check failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": time.time()
            }
    
    def check_authentication_service(self) -> dict:
        """Check authentication service health"""
        try:
            # Simple authentication service check
            # Test if authentication dependencies are available
            from app.core.deps import get_current_admin_user
            
            return {
                "status": "healthy",
                "message": "Authentication service is accessible",
                "timestamp": time.time()
            }
                
        except Exception as e:
            logger.error(f"Authentication service check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": time.time()
            }
    
    def get_comprehensive_health(self) -> dict:
        """Get comprehensive system health report"""
        
        database_health = self.check_database_health()
        system_health = self.check_system_resources()
        auth_health = self.check_authentication_service()
        
        # Determine overall status
        statuses = [
            database_health.get("status"),
            system_health.get("status"),
            auth_health.get("status")
        ]
        
        if "critical" in statuses or "unhealthy" in statuses:
            overall_status = "unhealthy"
        elif "degraded" in statuses:
            overall_status = "degraded"
        elif all(status == "healthy" for status in statuses):
            overall_status = "healthy"
        else:
            overall_status = "unknown"
        
        return {
            "overall_status": overall_status,
            "timestamp": time.time(),
            "services": {
                "database": database_health,
                "system": system_health,
                "authentication": auth_health
            }
        }


class MetricsCollector:
    """
    Collect and track application metrics
    """
    
    def __init__(self):
        self.metrics = {}
    
    def record_request(self, endpoint: str, method: str, status_code: int, processing_time: float):
        """Record request metrics"""
        key = f"{method}:{endpoint}"
        
        if key not in self.metrics:
            self.metrics[key] = {
                "count": 0,
                "success_count": 0,
                "error_count": 0,
                "total_time": 0.0,
                "min_time": float('inf'),
                "max_time": 0.0,
                "status_codes": {}
            }
        
        metrics = self.metrics[key]
        metrics["count"] += 1
        metrics["total_time"] += processing_time
        metrics["min_time"] = min(metrics["min_time"], processing_time)
        metrics["max_time"] = max(metrics["max_time"], processing_time)
        
        # Track status codes
        status_str = str(status_code)
        metrics["status_codes"][status_str] = metrics["status_codes"].get(status_str, 0) + 1
        
        # Track success/error
        if 200 <= status_code < 400:
            metrics["success_count"] += 1
        else:
            metrics["error_count"] += 1
    
    def get_metrics_summary(self) -> dict:
        """Get summary of all metrics"""
        summary = {}
        
        for endpoint, metrics in self.metrics.items():
            if metrics["count"] > 0:
                avg_time = metrics["total_time"] / metrics["count"]
                success_rate = (metrics["success_count"] / metrics["count"]) * 100
                
                summary[endpoint] = {
                    "total_requests": metrics["count"],
                    "success_count": metrics["success_count"],
                    "error_count": metrics["error_count"],
                    "success_rate": success_rate,
                    "avg_response_time": avg_time,
                    "min_response_time": metrics["min_time"],
                    "max_response_time": metrics["max_time"],
                    "status_codes": metrics["status_codes"]
                }
        
        return summary
    
    def reset_metrics(self):
        """Reset all metrics"""
        self.metrics = {}


# Global instances
health_checker = HealthChecker()
metrics_collector = MetricsCollector()
