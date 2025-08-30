import { authStore } from '../stores/authStore';
import { tenantStore } from '../stores/tenantStore';

export const useTenantContext = () => {
  const role = authStore.getRole();
  const userTenantId = authStore.getTenantId();
  const selectedTenantId = tenantStore.getSelectedTenantId();

  // Get effective tenant ID based on role
  const getEffectiveTenantId = (): number => {
    if (role === 'SUPER_ADMIN') {
      // Super admin uses selected tenant or defaults to 1
      return selectedTenantId || 1;
    } else if (role === 'HOTEL_ADMIN') {
      // Hotel admin uses their assigned tenant
      return userTenantId || 1;
    }
    // Fallback
    return 1;
  };

  return {
    tenantId: getEffectiveTenantId(),
    role,
    userTenantId,
    selectedTenantId,
  };
};
