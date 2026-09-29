import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import Medicine, Batch, StockLevel
from backend.schemas import MedicineCreate, MedicineResponse, BatchResponse
from backend.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/medicines", tags=["medicines"])

@router.get("", response_model=List[MedicineResponse])
def get_medicines(
    category: Optional[str] = None,
    requires_cold_chain: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Medicine)

    if category:
        query = query.filter(Medicine.category == category)
    if requires_cold_chain is not None:
        query = query.filter(Medicine.requires_cold_chain == requires_cold_chain)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Medicine.name.ilike(s)) |
            (Medicine.code.ilike(s)) |
            (Medicine.generic_name.ilike(s)) |
            (Medicine.manufacturer.ilike(s))
        )

    medicines = query.order_by(Medicine.name.asc()).all()
    today = datetime.date.today()
    results = []

    for med in medicines:
        batches_out = []
        tot_stock = 0
        for b in med.batches:
            days = (b.exp_date - today).days
            status_str = "expired" if days < 0 else "critical" if days <= 30 else "warning" if days <= 90 else "valid"
            batches_out.append(BatchResponse(
                id=b.id,
                batch_no=b.batch_no,
                medicine_id=b.medicine_id,
                mfg_date=b.mfg_date,
                exp_date=b.exp_date,
                total_initial_quantity=b.total_initial_quantity,
                barcode_sku=b.barcode_sku,
                status=b.status,
                created_at=b.created_at,
                days_to_expiry=days,
                expiry_status=status_str
            ))
            tot_stock += sum(s.quantity for s in b.stock_levels)

        med_dict = MedicineResponse(
            id=med.id,
            code=med.code,
            name=med.name,
            generic_name=med.generic_name,
            category=med.category,
            dosage_form=med.dosage_form,
            strength=med.strength,
            manufacturer=med.manufacturer,
            unit_price=med.unit_price,
            cost_price=med.cost_price,
            requires_cold_chain=med.requires_cold_chain,
            min_temperature=med.min_temperature,
            max_temperature=med.max_temperature,
            reorder_threshold=med.reorder_threshold,
            description=med.description,
            created_at=med.created_at,
            batches=batches_out,
            total_stock=tot_stock
        )
        results.append(med_dict)

    return results

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Medicine.category).distinct().all()
    return [c[0] for c in categories]

@router.get("/{med_id}", response_model=MedicineResponse)
def get_medicine_by_id(med_id: int, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter_by(id=med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    today = datetime.date.today()
    batches_out = []
    tot_stock = 0
    for b in med.batches:
        days = (b.exp_date - today).days
        status_str = "expired" if days < 0 else "critical" if days <= 30 else "warning" if days <= 90 else "valid"
        batches_out.append(BatchResponse(
            id=b.id,
            batch_no=b.batch_no,
            medicine_id=b.medicine_id,
            mfg_date=b.mfg_date,
            exp_date=b.exp_date,
            total_initial_quantity=b.total_initial_quantity,
            barcode_sku=b.barcode_sku,
            status=b.status,
            created_at=b.created_at,
            days_to_expiry=days,
            expiry_status=status_str
        ))
        tot_stock += sum(s.quantity for s in b.stock_levels)

    return MedicineResponse(
        id=med.id,
        code=med.code,
        name=med.name,
        generic_name=med.generic_name,
        category=med.category,
        dosage_form=med.dosage_form,
        strength=med.strength,
        manufacturer=med.manufacturer,
        unit_price=med.unit_price,
        cost_price=med.cost_price,
        requires_cold_chain=med.requires_cold_chain,
        min_temperature=med.min_temperature,
        max_temperature=med.max_temperature,
        reorder_threshold=med.reorder_threshold,
        description=med.description,
        created_at=med.created_at,
        batches=batches_out,
        total_stock=tot_stock
    )
