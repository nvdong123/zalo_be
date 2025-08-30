import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { authStore } from '../../stores/authStore';

// Lazy imports
const DashboardPage = React.lazy(() => import('../../modules/dashboard/DashboardPage'));
const HotelDashboard = React.lazy(() => import('../hotel/HotelDashboard'));

const DefaultDashboard: React.FC = () => {
  const role = authStore.getRole();
  
  // Debug info
  console.log('DefaultDashboard - Current role:', role);

  // Route to appropriate dashboard based on role
  if (role === 'SUPER_ADMIN') {
    console.log('DefaultDashboard - Rendering DashboardPage for SUPER_ADMIN');
    return (
      <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '100px auto' }} />}>
        <DashboardPage />
      </Suspense>
    );
  } else if (role === 'HOTEL_ADMIN') {
    console.log('DefaultDashboard - Rendering HotelDashboard for HOTEL_ADMIN');
    return (
      <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '100px auto' }} />}>
        <HotelDashboard />
      </Suspense>
    );
  } else {
    console.log('DefaultDashboard - No valid role, redirecting to login. Current role:', role);
    // If no valid role, show error or redirect to login
    return (
      <Alert
        message="Không có quyền truy cập"
        description={`Role hiện tại: ${role}. Vui lòng đăng nhập lại.`}
        type="error"
        showIcon
      />
    );
  }
};

export default DefaultDashboard;
