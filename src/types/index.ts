export type UserRole = 'SuperAdmin' | 'Pharmacist' | 'Warehouse_Staff' | 'Sales_Rep';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  warehouse_id?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  location: string;
  type: string;
  is_cold_storage: boolean;
  capacity: number;
  contact_email?: string;
  created_at: string;
}

export interface Batch {
  id: number;
  batch_no: string;
  medicine_id: number;
  mfg_date: string;
  exp_date: string;
  total_initial_quantity: number;
  barcode_sku?: string;
  status: string;
  created_at: string;
  days_to_expiry?: number;
  expiry_status?: 'critical' | 'warning' | 'valid' | 'expired';
}

export interface Medicine {
  id: number;
  code: string;
  name: string;
  generic_name: string;
  category: string;
  dosage_form: string;
  strength: string;
  manufacturer: string;
  unit_price: number;
  cost_price: number;
  requires_cold_chain: boolean;
  min_temperature: number;
  max_temperature: number;
  reorder_threshold: number;
  description?: string;
  created_at: string;
  batches: Batch[];
  total_stock: number;
}

export interface StockLevel {
  id: number;
  warehouse_id: number;
  batch_id: number;
  quantity: number;
  allocated_quantity: number;
  available_quantity: number;
  location_bin: string;
  updated_at: string;
  warehouse_name?: string;
  warehouse_code?: string;
  medicine_name?: string;
  medicine_category?: string;
  medicine_code?: string;
  batch_no?: string;
  exp_date?: string;
  days_to_expiry?: number;
  expiry_status?: 'critical' | 'warning' | 'valid' | 'expired';
}

export interface FEFOPickAllocation {
  batch_id: number;
  batch_no: string;
  mfg_date: string;
  exp_date: string;
  days_to_expiry: number;
  expiry_status: 'critical' | 'warning' | 'valid' | 'expired';
  warehouse_id: number;
  warehouse_name: string;
  location_bin: string;
  available_in_batch: number;
  quantity_to_dispense: number;
  batch_unit_cost: number;
  total_cost: number;
}

export interface FEFOResult {
  medicine_id: number;
  medicine_name: string;
  medicine_code: string;
  requested_quantity: number;
  allocated_quantity: number;
  unfulfilled_quantity: number;
  allocations: FEFOPickAllocation[];
  notes: string;
}

export type TransferStatus = 'Draft' | 'Pending Approval' | 'Dispatched' | 'Received & Reconciled' | 'Cancelled';

export interface TransferOrderItem {
  id: number;
  transfer_order_id: number;
  batch_id: number;
  quantity_requested: number;
  quantity_shipped: number;
  quantity_received: number;
  reconciled: boolean;
  batch_no?: string;
  medicine_name?: string;
  exp_date?: string;
}

export interface TransferOrder {
  id: number;
  order_no: string;
  source_warehouse_id: number;
  destination_warehouse_id: number;
  source_warehouse_name?: string;
  destination_warehouse_name?: string;
  status: TransferStatus;
  created_by_user_id: number;
  creator_name?: string;
  approved_by_user_id?: number | null;
  approver_name?: string | null;
  dispatched_at?: string | null;
  received_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items: TransferOrderItem[];
}
