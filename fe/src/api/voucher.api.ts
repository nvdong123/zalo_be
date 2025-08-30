import { request } from './request';

// Interface for Voucher data based on backend schema
export interface Voucher {
  id: number;
  tenant_id: number;
  voucher_code: string;
  voucher_name: string;
  description?: string;
  discount_type: string; // percentage, fixed_amount
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count?: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface VoucherCreate {
  voucher_code: string;
  voucher_name: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  valid_from: string;
  valid_to: string;
  is_active?: boolean;
  terms_conditions?: string;
  created_by?: string;
  updated_by?: string;
}

export interface VoucherUpdate {
  voucher_code?: string;
  voucher_name?: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  min_order_value?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
  terms_conditions?: string;
  updated_by?: string;
}

/**
 * Get all vouchers for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @returns A list of vouchers.
 */
export const getVouchers = (tenantId: number) => {
  return request<Voucher[]>('get', `/vouchers`, { tenant_id: tenantId });
};

/**
 * Create a new voucher for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param data - The data for the new voucher.
 * @returns The newly created voucher.
 */
export const createVoucher = (tenantId: number, data: VoucherCreate) => {
  return request<Voucher>('post', `/vouchers`, { 
    tenant_id: tenantId,
    ...data 
  });
};

/**
 * Get a single voucher by its ID for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param voucherId - The ID of the voucher.
 * @returns The voucher data.
 */
export const getVoucherById = (tenantId: number, voucherId: number) => {
    return request<Voucher>('get', `/vouchers/${voucherId}`, { tenant_id: tenantId });
};

/**
 * Update an existing voucher for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param voucherId - The ID of the voucher to update.
 * @param data - The new data for the voucher.
 * @returns The updated voucher.
 */
export const updateVoucher = (tenantId: number, voucherId: number, data: VoucherUpdate) => {
  return request<Voucher>('put', `/vouchers/${voucherId}`, {
    tenant_id: tenantId,
    ...data
  });
};

/**
 * Delete a voucher for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param voucherId - The ID of the voucher to delete.
 */
export const deleteVoucher = (tenantId: number, voucherId: number) => {
  return request('delete', `/vouchers/${voucherId}`, { 
    tenant_id: tenantId,
    deleted_by: 'admin'
  });
};
