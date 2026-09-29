import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import Medicine, Batch, StockLevel, Warehouse, User
from backend.schemas import StockLevelResponse, FEFOResult, FEFOPickAllocation
from backend.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

def calculate_expiry_status(exp_date: datetime.date, today: datetime.date):
    days = (exp_date - today).days
    if days < 0:
        return days, "expired"
    elif days <= 30:
        return days, "critical"
    elif days <= 90:
        return days, "warning"
    else:
        return days, "valid"

@router.get("/stock", response_model=List[StockLevelResponse])
def get_stock_levels(
    warehouse_id: Optional[int] = None,
    category: Optional[str] = None,
    expiry_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(StockLevel)
        .join(Batch, StockLevel.batch_id == Batch.id)
        .join(Medicine, Batch.medicine_id == Medicine.id)
        .join(Warehouse, StockLevel.warehouse_id == Warehouse.id)
    )

    if warehouse_id:
        query = query.filter(StockLevel.warehouse_id == warehouse_id)

    if category:
        query = query.filter(Medicine.category == category)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Medicine.name.ilike(search_filter)) |
            (Medicine.code.ilike(search_filter)) |
            (Batch.batch_no.ilike(search_filter))
        )

    results = query.all()
    today = datetime.date.today()
    out = []

    for stock in results:
        days, status = calculate_expiry_status(stock.batch.exp_date, today)
        if expiry_status and status != expiry_status:
            continue

        available = max(0, stock.quantity - stock.allocated_quantity)
        out.append(StockLevelResponse(
            id=stock.id,
            warehouse_id=stock.warehouse_id,
            batch_id=stock.batch_id,
            quantity=stock.quantity,
            allocated_quantity=stock.allocated_quantity,
            available_quantity=available,
            location_bin=stock.location_bin,
            updated_at=stock.updated_at,
            warehouse_name=stock.warehouse.name,
            warehouse_code=stock.warehouse.code,
            medicine_name=stock.batch.medicine.name,
            medicine_category=stock.batch.medicine.category,
            medicine_code=stock.batch.medicine.code,
            batch_no=stock.batch.batch_no,
            exp_date=stock.batch.exp_date,
            days_to_expiry=days,
            expiry_status=status
        ))

    # Sort primarily by expiry date ascending
    out.sort(key=lambda s: s.exp_date or datetime.date.max)
    return out

@router.get("/fefo-recommendation", response_model=FEFOResult)
def get_fefo_recommendation(
    medicine_id: int,
    quantity: int = Query(..., gt=0),
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    medicine = db.query(Medicine).filter_by(id=medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    today = datetime.date.today()

    # Query active batches sorted strictly by expiration date ASC (FEFO)
    query = (
        db.query(StockLevel)
        .join(Batch, StockLevel.batch_id == Batch.id)
        .filter(Batch.medicine_id == medicine_id)
        .filter(Batch.status == "Active")
        .filter(Batch.exp_date >= today) # Filter out already expired batches
    )

    if warehouse_id:
        query = query.filter(StockLevel.warehouse_id == warehouse_id)

    # Order strictly by Batch.exp_date ascending (FEFO core rule)
    stock_candidates = query.order_by(Batch.exp_date.asc(), StockLevel.quantity.desc()).all()

    remaining_needed = quantity
    allocations: List[FEFOPickAllocation] = []
    has_critical_allocation = False

    for stock in stock_candidates:
        available = stock.quantity - stock.allocated_quantity
        if available <= 0:
            continue

        take = min(available, remaining_needed)
        days, status = calculate_expiry_status(stock.batch.exp_date, today)

        if status == "critical":
            has_critical_allocation = True

        allocations.append(FEFOPickAllocation(
            batch_id=stock.batch.id,
            batch_no=stock.batch.batch_no,
            mfg_date=stock.batch.mfg_date,
            exp_date=stock.batch.exp_date,
            days_to_expiry=days,
            expiry_status=status,
            warehouse_id=stock.warehouse_id,
            warehouse_name=stock.warehouse.name,
            location_bin=stock.location_bin,
            available_in_batch=available,
            quantity_to_dispense=take,
            batch_unit_cost=medicine.cost_price,
            total_cost=round(take * medicine.cost_price, 2)
        ))

        remaining_needed -= take
        if remaining_needed <= 0:
            break

    allocated_qty = quantity - remaining_needed
    notes = []
    if remaining_needed > 0:
        notes.append(f"Insufficient stock: requested {quantity}, only {allocated_qty} units available across active batches.")
    else:
        notes.append("Optimal FEFO pick list generated. Earliest expiring batches allocated first.")

    if has_critical_allocation:
        notes.append("NOTICE: Allocation includes batch expiring in under 30 days. Prioritize prompt patient dispensing.")

    return FEFOResult(
        medicine_id=medicine.id,
        medicine_name=medicine.name,
        medicine_code=medicine.code,
        requested_quantity=quantity,
        allocated_quantity=allocated_qty,
        unfulfilled_quantity=remaining_needed,
        allocations=allocations,
        notes=" ".join(notes)
    )

@router.get("/expiry-dashboard")
def get_expiry_dashboard(
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    today = datetime.date.today()
    critical_threshold = today + datetime.timedelta(days=30)
    warning_threshold = today + datetime.timedelta(days=90)

    query = (
        db.query(StockLevel)
        .join(Batch, StockLevel.batch_id == Batch.id)
        .join(Medicine, Batch.medicine_id == Medicine.id)
        .join(Warehouse, StockLevel.warehouse_id == Warehouse.id)
    )

    if warehouse_id:
        query = query.filter(StockLevel.warehouse_id == warehouse_id)

    records = query.all()

    critical_items = []
    warning_items = []
    valid_items = []
    expired_items = []

    critical_value = 0.0
    warning_value = 0.0
    valid_value = 0.0
    expired_value = 0.0

    for stock in records:
        exp = stock.batch.exp_date
        qty = stock.quantity
        cost = stock.batch.medicine.cost_price
        val = qty * cost
        days = (exp - today).days

        item_repr = {
            "stock_id": stock.id,
            "medicine_id": stock.batch.medicine.id,
            "medicine_name": stock.batch.medicine.name,
            "medicine_code": stock.batch.medicine.code,
            "category": stock.batch.medicine.category,
            "batch_no": stock.batch.batch_no,
            "exp_date": str(exp),
            "days_to_expiry": days,
            "quantity": qty,
            "warehouse_name": stock.warehouse.name,
            "warehouse_code": stock.warehouse.code,
            "location_bin": stock.location_bin,
            "unit_cost": cost,
            "total_value": round(val, 2),
            "requires_cold_chain": stock.batch.medicine.requires_cold_chain
        }

        if days < 0:
            expired_items.append(item_repr)
            expired_value += val
        elif days <= 30:
            critical_items.append(item_repr)
            critical_value += val
        elif days <= 90:
            warning_items.append(item_repr)
            warning_value += val
        else:
            valid_items.append(item_repr)
            valid_value += val

    # Sort lists by days_to_expiry ascending
    critical_items.sort(key=lambda x: x["days_to_expiry"])
    warning_items.sort(key=lambda x: x["days_to_expiry"])

    return {
        "summary": {
            "total_stock_units": sum(s.quantity for s in records),
            "total_inventory_value": round(valid_value + warning_value + critical_value + expired_value, 2),
            "critical_units": sum(i["quantity"] for i in critical_items),
            "critical_value_at_risk": round(critical_value, 2),
            "critical_batch_count": len(critical_items),
            "warning_units": sum(i["quantity"] for i in warning_items),
            "warning_value_at_risk": round(warning_value, 2),
            "warning_batch_count": len(warning_items),
            "valid_units": sum(i["quantity"] for i in valid_items),
            "valid_value": round(valid_value, 2),
            "valid_batch_count": len(valid_items),
            "expired_units": sum(i["quantity"] for i in expired_items),
            "expired_value": round(expired_value, 2)
        },
        "critical_items": critical_items,
        "warning_items": warning_items,
        "valid_items_sample": valid_items[:20]
    }
