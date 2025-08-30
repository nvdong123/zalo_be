interface AuthState {
  token: string | null;
  role: 'SUPER_ADMIN' | 'HOTEL_ADMIN' | null;
  tenantId: number | null;
  userId: number | null;
  username: string | null;
}

class AuthStore {
  private state: AuthState = {
    token: null,
    role: null,
    tenantId: null,
    userId: null,
    username: null,
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('authState');
      if (stored) {
        this.state = { ...this.state, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load auth state from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('authState', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save auth state to storage:', error);
    }
  }

  getToken(): string | null {
    return this.state.token;
  }

  getRole(): 'SUPER_ADMIN' | 'HOTEL_ADMIN' | null {
    return this.state.role;
  }

  getTenantId(): number | null {
    return this.state.tenantId;
  }

  getUserId(): number | null {
    return this.state.userId;
  }

  getUsername(): string | null {
    return this.state.username;
  }

  isAuthenticated(): boolean {
    return !!this.state.token;
  }

  isSuperAdmin(): boolean {
    return this.state.role === 'SUPER_ADMIN';
  }

  isHotelAdmin(): boolean {
    return this.state.role === 'HOTEL_ADMIN';
  }

  setAuthData(data: Partial<AuthState>) {
    this.state = { ...this.state, ...data };
    this.saveToStorage();
  }

  login(authData: {
    token: string;
    role: 'SUPER_ADMIN' | 'HOTEL_ADMIN';
    tenantId?: number;
    userId?: number;
    username?: string;
  }) {
    this.state = {
      token: authData.token,
      role: authData.role,
      tenantId: authData.tenantId || null,
      userId: authData.userId || null,
      username: authData.username || null,
    };
    this.saveToStorage();
  }

  logout() {
    this.state = {
      token: null,
      role: null,
      tenantId: null,
      userId: null,
      username: null,
    };
    localStorage.removeItem('authState');
    localStorage.removeItem('tenantState');
    localStorage.removeItem('token'); // Also remove individual token
    
    // Clear any cached data
    window.location.reload(); // Force reload to clear all state
  }

  getState(): AuthState {
    return { ...this.state };
  }
}

export const authStore = new AuthStore();
