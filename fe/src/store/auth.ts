export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'hotel_admin';
  tenant_id?: number;
  full_name?: string;
}

export interface AuthData {
  user: AuthUser | null;
  access_token: string | null;
  refresh_token: string | null;
  currentTenantId: number | null;
}

const AUTH_STORAGE_KEY = 'hotel_auth';

class AuthStore {
  private data: AuthData = {
    user: null,
    access_token: null,
    refresh_token: null,
    currentTenantId: null,
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.data = { ...this.data, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clear();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving auth data to storage:', error);
    }
  }

  get(): AuthData {
    return { ...this.data };
  }

  set(partial: Partial<AuthData>) {
    this.data = { ...this.data, ...partial };
    this.saveToStorage();
  }

  clear() {
    this.data = {
      user: null,
      access_token: null,
      refresh_token: null,
      currentTenantId: null,
    };
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.data.access_token && !!this.data.user;
  }

  is(role: string): boolean {
    return this.data.user?.role === role;
  }

  isSuperAdmin(): boolean {
    return this.is('super_admin');
  }

  isHotelAdmin(): boolean {
    return this.is('hotel_admin');
  }

  tenantId(): number | null {
    if (this.isSuperAdmin()) {
      return this.data.currentTenantId;
    }
    if (this.isHotelAdmin()) {
      return this.data.user?.tenant_id || null;
    }
    return null;
  }

  hasRole(roles: string[]): boolean {
    if (!this.data.user) return false;
    return roles.includes(this.data.user.role);
  }
}

export const auth = new AuthStore();
