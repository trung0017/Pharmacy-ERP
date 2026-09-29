from typing import List, Optional
import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

# Auth & User schemas
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    warehouse_id: Optional[int] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

# Warehouse schemas
class WarehouseBase(BaseModel):
    name: str
    code: str
    location: str
    type: str = "Regional Distribution"
    is_cold_storage: bool = False
    capacity: int = 50000
    contact_email: Optional[str] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseResponse(WarehouseBase):
    id: int
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# Batch schemas
class BatchBase(BaseModel):
    batch_no: str
    mfg_date: datetime.date
    exp_date: datetime.date
    total_initial_quantity: int
    barcode_sku: Optional[str] = None
    status: str = "Active"

class BatchCreate(BatchBase):
    medicine_id: int

class BatchResponse(BatchBase):
    id: int
    medicine_id: int
    created_at: datetime.datetime
    days_to_expiry: Optional[int] = None
    expiry_status: Optional[str] = None # critical, warning, valid, expired
    model_config = ConfigDict(from_attributes=True)

# Medicine schemas
class MedicineBase(BaseModel):
    code: str
    name: str
    generic_name: str
    category: str
    dosage_form: str
    strength: str
    manufacturer: str
    unit_price: float
    cost_price: float
    requires_cold_chain: bool = False
    min_temperature: float = 15.0
    max_temperature: float = 25.0
    reorder_threshold: int = 100
    description: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineResponse(MedicineBase):
    id: int
    created_at: datetime.datetime
    batches: List[BatchResponse] = []
    total_stock: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

# StockLevel schemas
class StockLevelResponse(BaseModel):
    id: int
    warehouse_id: int
    batch_id: int
    quantity: int
    allocated_quantity: int
    available_quantity: int
    location_bin: str
    updated_at: datetime.datetime
    warehouse_name: Optional[str] = None
    warehouse_code: Optional[str] = None
    medicine_name: Optional[str] = None
    medicine_category: Optional[str] = None
    medicine_code: Optional[str] = None
    batch_no: Optional[str] = None
    exp_date: Optional[datetime.date] = None
    days_to_expiry: Optional[int] = None
    expiry_status: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Transfer Order schemas
class TransferOrderItemBase(BaseModel):
    batch_id: int
    quantity_requested: int

class TransferOrderItemCreate(TransferOrderItemBase):
    pass

class TransferOrderItemResponse(TransferOrderItemBase):
    id: int
    transfer_order_id: int
    quantity_shipped: int
    quantity_received: int
    reconciled: bool
    batch_no: Optional[str] = None
    medicine_name: Optional[str] = None
    exp_date: Optional[datetime.date] = None
    model_config = ConfigDict(from_attributes=True)

class TransferOrderCreate(BaseModel):
    source_warehouse_id: int
    destination_warehouse_id: int
    notes: Optional[str] = None
    items: List[TransferOrderItemCreate]

class TransferOrderResponse(BaseModel):
    id: int
    order_no: str
    source_warehouse_id: int
    destination_warehouse_id: int
    source_warehouse_name: Optional[str] = None
    destination_warehouse_name: Optional[str] = None
    status: str
    created_by_user_id: int
    creator_name: Optional[str] = None
    approved_by_user_id: Optional[int] = None
    approver_name: Optional[str] = None
    dispatched_at: Optional[datetime.datetime] = None
    received_at: Optional[datetime.datetime] = None
    notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    items: List[TransferOrderItemResponse] = []
    model_config = ConfigDict(from_attributes=True)

# FEFO Recommendation Schema
class FEFOPickAllocation(BaseModel):
    batch_id: int
    batch_no: str
    mfg_date: datetime.date
    exp_date: datetime.date
    days_to_expiry: int
    expiry_status: str # critical (<30d), warning (<90d), valid
    warehouse_id: int
    warehouse_name: str
    location_bin: str
    available_in_batch: int
    quantity_to_dispense: int
    batch_unit_cost: float
    total_cost: float

class FEFOResult(BaseModel):
    medicine_id: int
    medicine_name: str
    medicine_code: str
    requested_quantity: int
    allocated_quantity: int
    unfulfilled_quantity: int
    allocations: List[FEFOPickAllocation]
    notes: str
