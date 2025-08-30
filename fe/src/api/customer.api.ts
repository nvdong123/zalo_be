import { request } from './request';

// Interface for Customer data based on backend schema
export interface Customer {
  id: number;
  tenant_id: number;
  customer_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  passport_number?: string;
  id_card_number?: string;
  loyalty_points?: number;
  membership_level?: string;
  preferences?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface CustomerCreate {
  customer_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  passport_number?: string;
  id_card_number?: string;
  loyalty_points?: number;
  membership_level?: string;
  preferences?: string;
  special_requests?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CustomerUpdate {
  customer_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  passport_number?: string;
  id_card_number?: string;
  loyalty_points?: number;
  membership_level?: string;
  preferences?: string;
  special_requests?: string;
  updated_by?: string;
}

/**
 * Get all customers for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @returns A list of customers.
 */
export const getCustomers = (tenantId: number) => {
  return request<Customer[]>('get', `/customers`, { tenant_id: tenantId });
};

/**
 * Create a new customer for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param data - The data for the new customer.
 * @returns The newly created customer.
 */
export const createCustomer = (tenantId: number, data: CustomerCreate) => {
  return request<Customer>('post', `/customers`, { 
    tenant_id: tenantId,
    ...data 
  });
};

/**
 * Get a single customer by its ID for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param customerId - The ID of the customer.
 * @returns The customer data.
 */
export const getCustomerById = (tenantId: number, customerId: number) => {
    return request<Customer>('get', `/customers/${customerId}`, { tenant_id: tenantId });
};

/**
 * Update an existing customer for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param customerId - The ID of the customer to update.
 * @param data - The new data for the customer.
 * @returns The updated customer.
 */
export const updateCustomer = (tenantId: number, customerId: number, data: CustomerUpdate) => {
  return request<Customer>('put', `/customers/${customerId}`, {
    tenant_id: tenantId,
    ...data
  });
};

/**
 * Delete a customer for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param customerId - The ID of the customer to delete.
 */
export const deleteCustomer = (tenantId: number, customerId: number) => {
  return request('delete', `/customers/${customerId}`, { 
    tenant_id: tenantId,
    deleted_by: 'admin'
  });
};
