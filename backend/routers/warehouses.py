from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import Warehouse, StockLevel, Batch, Medicine
from backend.schemas import WarehouseResponse

router = APIRouter(prefix="/api/warehouses", tags=["warehouses"])

@router.get("", response_model=List[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).all()
    return warehouses

@router.get("/{wh_id}")
def get_warehouse_details(wh_id: int, db: Session = Depends(get_db)):
    wh = db.query(Warehouse).filter_by(id=wh_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    # Aggregate stats
    stock_count = db.query(func.sum(StockLevel.quantity)).filter(StockLevel.warehouse_id == wh_id).scalar() or 0
    unique_medicines = (
        db.query(Medicine.id)
        .join(Batch, Batch.medicine_id == Medicine.id)
        .join(StockLevel, StockLevel.batch_id == Batch.id)
        .filter(StockLevel.warehouse_id == wh_id)
        .distinct()
        .count()
    )

    return {
        "id": wh.id,
        "name": wh.name,
        "code": wh.code,
        "location": wh.location,
        "type": wh.type,
        "is_cold_storage": wh.is_cold_storage,
        "capacity": wh.capacity,
        "contact_email": wh.contact_email,
        "created_at": wh.created_at,
        "current_stock_units": stock_count,
        "utilization_pct": round((stock_count / wh.capacity) * 100, 1) if wh.capacity else 0,
        "unique_skus": unique_medicines
    }
