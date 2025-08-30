import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { auth } from '@/store/auth';

interface WithRoleProps {
  roles?: string[];
  fallback?: React.ReactNode;
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleProps = {}
) {
  const { roles, fallback } = options;

  return function ProtectedComponent(props: P) {
    const authData = auth.get();

    // Check if user is logged in
    if (!auth.isLoggedIn()) {
      return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (roles && !auth.hasRole(roles)) {
      return (
        fallback || (
          <Result
            status="403"
            title="403"
            subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                Quay lại
              </Button>
            }
          />
        )
      );
    }

    return <Component {...props} />;
  };
}

export default withRole;
