import { request } from '../utils/request';
import { authStore } from '../stores/authStore';
import { tenantStore } from '../stores/tenantStore';

// Helper to get current tenant ID
const getCurrentTenantId = (): number => {
  const role = authStore.getRole();
  if (role === 'SUPER_ADMIN') {
    return tenantStore.getSelectedTenantId() || 1;
  } else if (role === 'HOTEL_ADMIN') {
    return authStore.getTenantId() || 1;
  }
  return 1;
};

export interface InventoryItem {
  id: number;
  tenant_id: number;
  item_name: string;
  item_code?: string;
  category: 'room_amenities' | 'housekeeping' | 'food_beverage' | 'maintenance' | 'office' | 'other';
  description?: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_cost: number;
  supplier_name?: string;
  supplier_contact?: string;
  location?: string;
  status: 'active' | 'inactive' | 'discontinued';
  last_restock_date?: string;
  expiry_date?: string;
  barcode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryCreateData {
  item_name: string;
  item_code?: string;
  category: 'room_amenities' | 'housekeeping' | 'food_beverage' | 'maintenance' | 'office' | 'other';
  description?: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_cost: number;
  supplier_name?: string;
  supplier_contact?: string;
  location?: string;
  expiry_date?: string;
  barcode?: string;
  notes?: string;
}

export interface InventoryUpdateData {
  item_name?: string;
  item_code?: string;
  category?: 'room_amenities' | 'housekeeping' | 'food_beverage' | 'maintenance' | 'office' | 'other';
  description?: string;
  unit?: string;
  current_stock?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  unit_cost?: number;
  supplier_name?: string;
  supplier_contact?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  expiry_date?: string;
  barcode?: string;
  notes?: string;
}

export interface InventoryQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  low_stock_only?: boolean;
  location?: string;
}

export interface StockAdjustment {
  id: number;
  tenant_id: number;
  inventory_item_id: number;
  adjustment_type: 'addition' | 'reduction' | 'restock' | 'consumption' | 'damage' | 'expired';
  quantity: number;
  reason?: string;
  reference_number?: string;
  performed_by: string;
  adjustment_date: string;
  created_at: string;
}

export interface StockAdjustmentData {
  adjustment_type: 'addition' | 'reduction' | 'restock' | 'consumption' | 'damage' | 'expired';
  quantity: number;
  reason?: string;
  reference_number?: string;
}

export const inventoryAPI = {
  // Get all inventory items with pagination
  getAll: async (params?: InventoryQueryParams): Promise<InventoryItem[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/inventory', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...params 
      } 
    });
  },

  // Get inventory item by ID
  getById: async (id: number): Promise<InventoryItem> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/inventory/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new inventory item
  create: async (data: InventoryCreateData): Promise<InventoryItem> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/inventory', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update inventory item
  update: async (id: number, data: InventoryUpdateData): Promise<InventoryItem> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/inventory/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Delete inventory item
  delete: async (id: number): Promise<void> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/inventory/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Adjust stock
  adjustStock: async (id: number, data: StockAdjustmentData): Promise<StockAdjustment> => {
    const tenantId = getCurrentTenantId();
    return request.post(`/api/v1/inventory/${id}/adjust-stock`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Get stock adjustments for an item
  getStockAdjustments: async (id: number, params?: { skip?: number; limit?: number }): Promise<StockAdjustment[]> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/inventory/${id}/adjustments`, {
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 50
      }
    });
  },

  // Get low stock items
  getLowStock: async (): Promise<InventoryItem[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/inventory/low-stock', {
      params: { tenant_id: tenantId }
    });
  },

  // Get inventory statistics
  getStats: async (): Promise<{
    total_items: number;
    active_items: number;
    low_stock_items: number;
    total_value: number;
    categories: { [key: string]: number };
  }> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/inventory/stats', {
      params: { tenant_id: tenantId }
    });
  },

  // Export inventory to CSV
  exportCSV: async (): Promise<Blob> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/inventory/export', {
      params: { tenant_id: tenantId },
      responseType: 'blob'
    });
  }
};
