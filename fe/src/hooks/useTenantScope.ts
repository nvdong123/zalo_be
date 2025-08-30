import { useMemo } from 'react';
import { auth } from '@/store/auth';

export interface TenantScope {
  tenantId: number | null;
  isSuperAdmin: boolean;
  isHotelAdmin: boolean;
  hasSelectedTenant: boolean;
}

export function useTenantScope(): TenantScope {
  return useMemo(() => {
    const authData = auth.get();
    const isSuperAdmin = auth.isSuperAdmin();
    const isHotelAdmin = auth.isHotelAdmin();
    const tenantId = auth.tenantId();
    
    return {
      tenantId,
      isSuperAdmin,
      isHotelAdmin,
      hasSelectedTenant: isSuperAdmin ? !!tenantId : true, // hotel_admin always has tenant
    };
  }, []);
}

export default useTenantScope;
