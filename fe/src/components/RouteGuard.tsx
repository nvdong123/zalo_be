import React from 'react';
import { Navigate } from 'react-router-dom';
import { authStore } from '../stores/authStore';
import { Result, Button } from 'antd';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: ('SUPER_ADMIN' | 'HOTEL_ADMIN')[];
  redirectTo?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard' 
}) => {
  const currentRole = authStore.getRole();
  
  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // If no role or role not allowed, show access denied or redirect
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => window.location.href = redirectTo}>
            Back to Dashboard
          </Button>
        }
      />
    );
  }
  
  return <>{children}</>;
};

export default RouteGuard;
