import time
from typing import Dict, Any, Optional
from collections import defaultdict, deque
import threading


class RateLimiter:
    """
    Rate limiting implementation for API endpoints
    """
    
    def __init__(self):
        self.clients = defaultdict(lambda: {
            'requests': deque(),
            'blocked_until': 0
        })
        self.lock = threading.Lock()
        
        # Rate limit configurations
        self.limits = {
            'default': {'requests': 100, 'window': 60},  # 100 requests per minute
            'auth': {'requests': 10, 'window': 60},      # 10 auth requests per minute
            'upload': {'requests': 20, 'window': 60},    # 20 uploads per minute
            'search': {'requests': 200, 'window': 60},   # 200 search requests per minute
        }
        
        # Block durations (in seconds)
        self.block_durations = {
            'soft': 60,      # 1 minute
            'medium': 300,   # 5 minutes
            'hard': 3600,    # 1 hour
        }
    
    def is_allowed(self, client_id: str, endpoint_type: str = 'default') -> Dict[str, Any]:
        """Check if request is allowed for client"""
        
        current_time = time.time()
        
        with self.lock:
            client_data = self.clients[client_id]
            
            # Check if client is currently blocked
            if current_time < client_data['blocked_until']:
                return {
                    'allowed': False,
                    'reason': 'rate_limited',
                    'blocked_until': client_data['blocked_until'],
                    'retry_after': int(client_data['blocked_until'] - current_time)
                }
            
            # Get rate limit config for endpoint type
            limit_config = self.limits.get(endpoint_type, self.limits['default'])
            max_requests = limit_config['requests']
            time_window = limit_config['window']
            
            # Clean old requests outside the time window
            requests = client_data['requests']
            while requests and requests[0] < current_time - time_window:
                requests.popleft()
            
            # Check if within limit
            if len(requests) < max_requests:
                requests.append(current_time)
                return {
                    'allowed': True,
                    'remaining': max_requests - len(requests),
                    'reset_time': current_time + time_window
                }
            else:
                # Rate limit exceeded - determine block duration
                violation_count = self._get_violation_count(client_id)
                block_duration = self._get_block_duration(violation_count)
                
                client_data['blocked_until'] = current_time + block_duration
                
                return {
                    'allowed': False,
                    'reason': 'rate_limit_exceeded',
                    'blocked_until': client_data['blocked_until'],
                    'retry_after': block_duration,
                    'violation_count': violation_count
                }
    
    def _get_violation_count(self, client_id: str) -> int:
        """Get violation count for progressive blocking"""
        
        # In production, this would be stored in Redis or database
        # For now, using simple in-memory tracking
        if not hasattr(self, '_violations'):
            self._violations = defaultdict(int)
        
        return self._violations[client_id]
    
    def _get_block_duration(self, violation_count: int) -> int:
        """Get block duration based on violation count"""
        
        if violation_count <= 1:
            return self.block_durations['soft']
        elif violation_count <= 3:
            return self.block_durations['medium']
        else:
            return self.block_durations['hard']
    
    def reset_client(self, client_id: str):
        """Reset rate limit for a client"""
        
        with self.lock:
            if client_id in self.clients:
                del self.clients[client_id]
            
            if hasattr(self, '_violations') and client_id in self._violations:
                del self._violations[client_id]
    
    def get_client_status(self, client_id: str) -> Dict[str, Any]:
        """Get current status for a client"""
        
        current_time = time.time()
        
        with self.lock:
            client_data = self.clients[client_id]
            
            # Clean old requests
            requests = client_data['requests']
            while requests and requests[0] < current_time - 60:  # Using default window
                requests.popleft()
            
            return {
                'client_id': client_id,
                'current_requests': len(requests),
                'blocked_until': client_data['blocked_until'],
                'is_blocked': current_time < client_data['blocked_until'],
                'violation_count': self._get_violation_count(client_id)
            }


class SecurityValidator:
    """
    Security validation for requests
    """
    
    def __init__(self):
        self.suspicious_patterns = [
            # SQL Injection patterns
            r"('|(\\')|(;)|(\-\-)|(\s+(or|and)\s+)",
            r"(union\s+select|insert\s+into|delete\s+from|update\s+set)",
            
            # XSS patterns
            r"(<script|</script>|javascript:|onload=|onerror=)",
            r"(<iframe|<object|<embed|<applet)",
            
            # Path traversal patterns
            r"(\.\./|\.\.\\|%2e%2e)",
            
            # Command injection patterns
            r"(;|\||\&|\$\(|\`)",
        ]
        
        self.blocked_user_agents = [
            'sqlmap', 'nikto', 'nmap', 'masscan', 'zap',
            'burp', 'w3af', 'skipfish', 'arachni'
        ]
    
    def validate_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate request for security threats"""
        
        violations = []
        risk_score = 0
        
        # Check User-Agent
        user_agent = request_data.get('user_agent', '').lower()
        for blocked_agent in self.blocked_user_agents:
            if blocked_agent in user_agent:
                violations.append(f"Suspicious user agent: {blocked_agent}")
                risk_score += 50
        
        # Check request parameters
        params = request_data.get('params', {})
        for key, value in params.items():
            if isinstance(value, str):
                for pattern in self.suspicious_patterns:
                    import re
                    if re.search(pattern, value, re.IGNORECASE):
                        violations.append(f"Suspicious pattern in {key}: {pattern}")
                        risk_score += 30
        
        # Check request body
        body = request_data.get('body', '')
        if isinstance(body, str):
            for pattern in self.suspicious_patterns:
                import re
                if re.search(pattern, body, re.IGNORECASE):
                    violations.append(f"Suspicious pattern in body: {pattern}")
                    risk_score += 30
        
        # Determine threat level
        if risk_score >= 100:
            threat_level = 'critical'
        elif risk_score >= 50:
            threat_level = 'high'
        elif risk_score >= 20:
            threat_level = 'medium'
        else:
            threat_level = 'low'
        
        return {
            'is_safe': len(violations) == 0,
            'violations': violations,
            'risk_score': risk_score,
            'threat_level': threat_level,
            'action': 'block' if risk_score >= 50 else 'monitor'
        }


class IPGeolocation:
    """
    IP-based geolocation and reputation checking
    """
    
    def __init__(self):
        # In production, integrate with services like:
        # - MaxMind GeoIP2
        # - IP2Location
        # - AbuseIPDB
        # - VirusTotal
        
        self.blocked_countries = ['CN', 'RU', 'KP']  # Example blocked countries
        self.blocked_ip_ranges = [
            # Example malicious IP ranges
            '10.0.0.0/8',    # Private network (shouldn't access from outside)
            '172.16.0.0/12', # Private network
            '192.168.0.0/16' # Private network
        ]
        
        # Cache for IP lookups
        self.ip_cache = {}
    
    def check_ip(self, ip_address: str) -> Dict[str, Any]:
        """Check IP address for security threats"""
        
        # Check cache first
        if ip_address in self.ip_cache:
            return self.ip_cache[ip_address]
        
        result = {
            'ip_address': ip_address,
            'is_safe': True,
            'country_code': None,
            'is_proxy': False,
            'is_tor': False,
            'reputation_score': 100,  # 0-100, higher is better
            'threats': []
        }
        
        # Check if IP is in blocked ranges
        if self._is_ip_in_blocked_ranges(ip_address):
            result['is_safe'] = False
            result['threats'].append('blocked_ip_range')
            result['reputation_score'] -= 50
        
        # In production, you would make API calls to geolocation services
        # For now, using placeholder logic
        result['country_code'] = self._get_country_code(ip_address)
        
        if result['country_code'] in self.blocked_countries:
            result['is_safe'] = False
            result['threats'].append('blocked_country')
            result['reputation_score'] -= 30
        
        # Cache result
        self.ip_cache[ip_address] = result
        
        return result
    
    def _is_ip_in_blocked_ranges(self, ip_address: str) -> bool:
        """Check if IP is in blocked ranges"""
        
        import ipaddress
        
        try:
            ip = ipaddress.ip_address(ip_address)
            
            for blocked_range in self.blocked_ip_ranges:
                if ip in ipaddress.ip_network(blocked_range, strict=False):
                    return True
        except ValueError:
            # Invalid IP address
            return True
        
        return False
    
    def _get_country_code(self, ip_address: str) -> Optional[str]:
        """Get country code for IP address"""
        
        # Placeholder implementation
        # In production, use actual geolocation service
        
        private_ranges = [
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16',
            '127.0.0.0/8'
        ]
        
        import ipaddress
        
        try:
            ip = ipaddress.ip_address(ip_address)
            
            for private_range in private_ranges:
                if ip in ipaddress.ip_network(private_range, strict=False):
                    return 'PRIVATE'
            
            # Return a placeholder country code
            return 'US'
        except ValueError:
            return None


# Global instances
rate_limiter = RateLimiter()
security_validator = SecurityValidator()
ip_geolocation = IPGeolocation()
