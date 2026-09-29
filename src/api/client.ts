import { Medicine, Warehouse, StockLevel, FEFOResult, TransferOrder, User } from '../types';

const BASE_URL = '/api';

export async function fetchMedicines(search?: string, category?: string): Promise<Medicine[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  const res = await fetch(`${BASE_URL}/medicines?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch medicines');
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/medicines/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await fetch(`${BASE_URL}/warehouses`);
  if (!res.ok) throw new Error('Failed to fetch warehouses');
  return res.json();
}

export async function fetchStock(warehouseId?: number, category?: string, status?: string): Promise<StockLevel[]> {
  const params = new URLSearchParams();
  if (warehouseId) params.append('warehouse_id', warehouseId.toString());
  if (category) params.append('category', category);
  if (status) params.append('expiry_status', status);
  const res = await fetch(`${BASE_URL}/inventory/stock?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch stock');
  return res.json();
}

export async function fetchExpiryDashboard(warehouseId?: number) {
  const params = new URLSearchParams();
  if (warehouseId) params.append('warehouse_id', warehouseId.toString());
  const res = await fetch(`${BASE_URL}/inventory/expiry-dashboard?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch expiry dashboard');
  return res.json();
}

export async function fetchFEFORecommendation(medicineId: number, quantity: number, warehouseId?: number): Promise<FEFOResult> {
  const params = new URLSearchParams({
    medicine_id: medicineId.toString(),
    quantity: quantity.toString(),
  });
  if (warehouseId) params.append('warehouse_id', warehouseId.toString());
  const res = await fetch(`${BASE_URL}/inventory/fefo-recommendation?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate FEFO recommendation');
  }
  return res.json();
}

export async function fetchTransferOrders(status?: string, warehouseId?: number): Promise<TransferOrder[]> {
  const params = new URLSearchParams();
  if (status) params.append('status_filter', status);
  if (warehouseId) params.append('warehouse_id', warehouseId.toString());
  const res = await fetch(`${BASE_URL}/transfers?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transfer orders');
  return res.json();
}

export async function transitionTransferOrder(orderId: number, targetStatus: string): Promise<TransferOrder> {
  const res = await fetch(`${BASE_URL}/transfers/${orderId}/transition?target_status=${encodeURIComponent(targetStatus)}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to transition transfer order');
  }
  return res.json();
}

export async function createTransferOrder(data: {
  source_warehouse_id: number;
  destination_warehouse_id: number;
  notes?: string;
  items: { batch_id: number; quantity_requested: number }[];
}): Promise<TransferOrder> {
  const res = await fetch(`${BASE_URL}/transfers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create transfer order');
  }
  return res.json();
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/me`);
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

export async function switchDemoRole(role: string): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${BASE_URL}/auth/switch-demo-role?role=${encodeURIComponent(role)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to switch role');
  return res.json();
}

export async function fetchAnalyticsOverview() {
  const res = await fetch(`${BASE_URL}/analytics/overview`);
  if (!res.ok) throw new Error('Failed to fetch analytics overview');
  return res.json();
}

export async function fetchCategoryPerformance() {
  const res = await fetch(`${BASE_URL}/analytics/category-performance`);
  if (!res.ok) throw new Error('Failed to fetch category performance');
  return res.json();
}

export async function fetchExpiryLossEstimation() {
  const res = await fetch(`${BASE_URL}/analytics/expiry-loss-estimation`);
  if (!res.ok) throw new Error('Failed to fetch expiry loss estimation');
  return res.json();
}
