import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import Medicine, Batch, StockLevel, TransferOrder, Warehouse

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    today = datetime.date.today()
    critical_threshold = today + datetime.timedelta(days=30)
    warning_threshold = today + datetime.timedelta(days=90)

    # 1. Total Medicines & Batches
    medicine_count = db.query(Medicine).count()
    batch_count = db.query(Batch).count()

    # 2. Total Units & Financial Value
    stocks = (
        db.query(StockLevel, Medicine.cost_price, Medicine.unit_price, Batch.exp_date)
        .join(Batch, StockLevel.batch_id == Batch.id)
        .join(Medicine, Batch.medicine_id == Medicine.id)
        .all()
    )

    total_units = sum(s[0].quantity for s in stocks)
    total_cost_val = sum(s[0].quantity * s[1] for s in stocks)
    total_retail_val = sum(s[0].quantity * s[2] for s in stocks)
    projected_margin = total_retail_val - total_cost_val
    margin_pct = (projected_margin / total_retail_val * 100) if total_retail_val else 0

    # 3. Expiry risk calculations
    critical_risk_val = 0.0
    warning_risk_val = 0.0
    for stock, cost, unit, exp in stocks:
        if exp < today:
            pass
        elif exp <= critical_threshold:
            critical_risk_val += (stock.quantity * cost)
        elif exp <= warning_threshold:
            warning_risk_val += (stock.quantity * cost)

    # 4. Transfer order metrics
    open_transfers = db.query(TransferOrder).filter(
        TransferOrder.status.in_(["Draft", "Pending Approval", "Dispatched"])
    ).count()

    return {
        "medicine_count": medicine_count,
        "batch_count": batch_count,
        "total_stock_units": total_units,
        "inventory_cost_valuation": round(total_cost_val, 2),
        "inventory_retail_valuation": round(total_retail_val, 2),
        "projected_gross_margin": round(projected_margin, 2),
        "gross_margin_percentage": round(margin_pct, 1),
        "critical_expiry_loss_at_risk": round(critical_risk_val, 2),
        "warning_expiry_value": round(warning_risk_val, 2),
        "open_transfers_count": open_transfers
    }

@router.get("/category-performance")
def get_category_performance(db: Session = Depends(get_db)):
    """Aggregated analytical endpoint: Revenue potential, inventory cost, and profit margin by category."""
    medicines = db.query(Medicine).all()
    categories_data: Dict[str, Dict[str, Any]] = {}

    for med in medicines:
        cat = med.category
        if cat not in categories_data:
            categories_data[cat] = {
                "category": cat,
                "skus": 0,
                "total_units": 0,
                "total_cost": 0.0,
                "projected_revenue": 0.0,
                "avg_margin_pct": 0.0,
                "requires_cold_chain": False
            }

        categories_data[cat]["skus"] += 1
        if med.requires_cold_chain:
            categories_data[cat]["requires_cold_chain"] = True

        for b in med.batches:
            for s in b.stock_levels:
                qty = s.quantity
                categories_data[cat]["total_units"] += qty
                categories_data[cat]["total_cost"] += (qty * med.cost_price)
                categories_data[cat]["projected_revenue"] += (qty * med.unit_price)

    result = []
    for cat, val in categories_data.items():
        cost = val["total_cost"]
        rev = val["projected_revenue"]
        margin = rev - cost
        margin_pct = (margin / rev * 100) if rev else 0

        result.append({
            "category": cat,
            "skus": val["skus"],
            "total_units": val["total_units"],
            "total_cost": round(cost, 2),
            "projected_revenue": round(rev, 2),
            "profit_margin": round(margin, 2),
            "margin_percentage": round(margin_pct, 1),
            "requires_cold_chain": val["requires_cold_chain"]
        })

    result.sort(key=lambda x: x["projected_revenue"], reverse=True)
    return result

@router.get("/expiry-loss-estimation")
def get_expiry_loss_estimation(db: Session = Depends(get_db)):
    """Expiry loss estimation modeling across time windows with FEFO optimization potential."""
    today = datetime.date.today()
    stocks = (
        db.query(StockLevel, Medicine.cost_price, Batch.exp_date, Medicine.name, Medicine.category)
        .join(Batch, StockLevel.batch_id == Batch.id)
        .join(Medicine, Batch.medicine_id == Medicine.id)
        .all()
    )

    buckets = {
        "0_30_days": {"label": "< 30 Days (Critical)", "units": 0, "loss_estimate": 0.0, "color": "#ef4444"},
        "31_60_days": {"label": "31 - 60 Days", "units": 0, "loss_estimate": 0.0, "color": "#f97316"},
        "61_90_days": {"label": "61 - 90 Days", "units": 0, "loss_estimate": 0.0, "color": "#eab308"},
        "91_180_days": {"label": "91 - 180 Days", "units": 0, "loss_estimate": 0.0, "color": "#3b82f6"},
        "181_plus_days": {"label": "180+ Days (Safe)", "units": 0, "loss_estimate": 0.0, "color": "#10b981"},
    }

    for stock, cost, exp, name, category in stocks:
        days = (exp - today).days
        val = stock.quantity * cost

        if days <= 30:
            b = buckets["0_30_days"]
        elif days <= 60:
            b = buckets["31_60_days"]
        elif days <= 90:
            b = buckets["61_90_days"]
        elif days <= 180:
            b = buckets["91_180_days"]
        else:
            b = buckets["181_plus_days"]

        b["units"] += stock.quantity
        b["loss_estimate"] += val

    for b in buckets.values():
        b["loss_estimate"] = round(b["loss_estimate"], 2)

    total_at_risk_90d = (
        buckets["0_30_days"]["loss_estimate"] +
        buckets["31_60_days"]["loss_estimate"] +
        buckets["61_90_days"]["loss_estimate"]
    )

    # FEFO mitigation model: FEFO automated prioritization saves an estimated 65-75% of impending expiry losses
    fefo_savings_estimate = round(total_at_risk_90d * 0.72, 2)

    return {
        "buckets": list(buckets.values()),
        "total_at_risk_90_days": round(total_at_risk_90d, 2),
        "estimated_savings_with_fefo": fefo_savings_estimate,
        "recommendation": "Maintain FEFO priority dispensing on Critical (<30d) batches and initiate inter-warehouse transfers to high-velocity dispensaries."
    }
