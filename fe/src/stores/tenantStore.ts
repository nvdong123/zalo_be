interface TenantState {
  selectedTenantId: number | null;
  availableTenants: Array<{
    id: number;
    name: string;
    domain?: string;
  }>;
}

class TenantStore {
  private state: TenantState = {
    selectedTenantId: null,
    availableTenants: [],
  };

  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('tenantState');
      if (stored) {
        this.state = { ...this.state, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load tenant state from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('tenantState', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save tenant state to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  getSelectedTenantId(): number | null {
    return this.state.selectedTenantId;
  }

  getAvailableTenants(): Array<{ id: number; name: string; domain?: string }> {
    return [...this.state.availableTenants];
  }

  setSelectedTenantId(tenantId: number | null) {
    this.state.selectedTenantId = tenantId;
    this.saveToStorage();
    this.notifyListeners();
  }

  setAvailableTenants(tenants: Array<{ id: number; name: string; domain?: string }>) {
    this.state.availableTenants = tenants;
    this.saveToStorage();
    this.notifyListeners();
  }

  addTenant(tenant: { id: number; name: string; domain?: string }) {
    if (!this.state.availableTenants.find(t => t.id === tenant.id)) {
      this.state.availableTenants.push(tenant);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  removeTenant(tenantId: number) {
    this.state.availableTenants = this.state.availableTenants.filter(t => t.id !== tenantId);
    if (this.state.selectedTenantId === tenantId) {
      this.state.selectedTenantId = null;
    }
    this.saveToStorage();
    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): TenantState {
    return { ...this.state };
  }

  clear() {
    this.state = {
      selectedTenantId: null,
      availableTenants: [],
    };
    localStorage.removeItem('tenantState');
    this.notifyListeners();
  }
}

export const tenantStore = new TenantStore();
