import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Text,
    Index
)
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Pharmacist", index=True) # SuperAdmin, Pharmacist, Warehouse_Staff, Sales_Rep
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="staff_members")
    created_transfers = relationship("TransferOrder", foreign_keys="TransferOrder.created_by_user_id", back_populates="creator")
    approved_transfers = relationship("TransferOrder", foreign_keys="TransferOrder.approved_by_user_id", back_populates="approver")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    location = Column(String(255), nullable=False)
    type = Column(String(100), default="Regional Distribution")
    is_cold_storage = Column(Boolean, default=False)
    capacity = Column(Integer, default=50000)
    contact_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    stock_levels = relationship("StockLevel", back_populates="warehouse", cascade="all, delete-orphan")
    staff_members = relationship("User", back_populates="warehouse")
    outbound_transfers = relationship("TransferOrder", foreign_keys="TransferOrder.source_warehouse_id", back_populates="source_warehouse")
    inbound_transfers = relationship("TransferOrder", foreign_keys="TransferOrder.destination_warehouse_id", back_populates="destination_warehouse")


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # SKU or NDC
    name = Column(String(255), nullable=False, index=True)
    generic_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True) # Antibiotics, Pain Relief, Vaccines, etc.
    dosage_form = Column(String(100), nullable=False) # Capsule, Tablet, Vial, Inhaler, Ampoule
    strength = Column(String(100), nullable=False) # e.g. 500mg, 100IU/mL
    manufacturer = Column(String(255), nullable=False)
    unit_price = Column(Float, nullable=False) # Selling price
    cost_price = Column(Float, nullable=False) # Purchasing cost
    requires_cold_chain = Column(Boolean, default=False)
    min_temperature = Column(Float, default=15.0) # Celsius
    max_temperature = Column(Float, default=25.0)
    reorder_threshold = Column(Integer, default=100)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    batches = relationship("Batch", back_populates="medicine", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_medicine_category_name", "category", "name"),
    )


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_no = Column(String(100), unique=True, index=True, nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    mfg_date = Column(Date, nullable=False)
    exp_date = Column(Date, nullable=False, index=True) # Crucial index for FEFO query ordering
    total_initial_quantity = Column(Integer, nullable=False)
    barcode_sku = Column(String(100), nullable=True)
    status = Column(String(50), default="Active") # Active, Quarantined, Expired, Recalled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    medicine = relationship("Medicine", back_populates="batches")
    stock_levels = relationship("StockLevel", back_populates="batch", cascade="all, delete-orphan")
    transfer_items = relationship("TransferOrderItem", back_populates="batch")

    __table_args__ = (
        Index("idx_batch_exp_medicine", "exp_date", "medicine_id"),
    )


class StockLevel(Base):
    __tablename__ = "stock_levels"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    quantity = Column(Integer, default=0, nullable=False)
    allocated_quantity = Column(Integer, default=0, nullable=False) # Reserved for outgoing transfers
    location_bin = Column(String(100), default="Zone-A/R01")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="stock_levels")
    batch = relationship("Batch", back_populates="stock_levels")

    __table_args__ = (
        Index("idx_stock_warehouse_batch", "warehouse_id", "batch_id", unique=True),
    )


class TransferOrder(Base):
    __tablename__ = "transfer_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(100), unique=True, index=True, nullable=False)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    destination_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    status = Column(String(50), default="Draft", index=True) # Draft -> Pending Approval -> Dispatched -> Received & Reconciled | Cancelled
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    dispatched_at = Column(DateTime, nullable=True)
    received_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id], back_populates="outbound_transfers")
    destination_warehouse = relationship("Warehouse", foreign_keys=[destination_warehouse_id], back_populates="inbound_transfers")
    creator = relationship("User", foreign_keys=[created_by_user_id], back_populates="created_transfers")
    approver = relationship("User", foreign_keys=[approved_by_user_id], back_populates="approved_transfers")
    items = relationship("TransferOrderItem", back_populates="transfer_order", cascade="all, delete-orphan")


class TransferOrderItem(Base):
    __tablename__ = "transfer_order_items"

    id = Column(Integer, primary_key=True, index=True)
    transfer_order_id = Column(Integer, ForeignKey("transfer_orders.id"), nullable=False, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    quantity_requested = Column(Integer, nullable=False)
    quantity_shipped = Column(Integer, default=0)
    quantity_received = Column(Integer, default=0)
    reconciled = Column(Boolean, default=False)

    transfer_order = relationship("TransferOrder", back_populates="items")
    batch = relationship("Batch", back_populates="transfer_items")
