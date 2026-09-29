import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import TransferOrder, TransferOrderItem, StockLevel, Batch, Warehouse, User, Medicine
from backend.schemas import TransferOrderCreate, TransferOrderResponse, TransferOrderItemResponse
from backend.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/transfers", tags=["transfers"])

def format_transfer_order(order: TransferOrder) -> TransferOrderResponse:
    items_out = []
    for item in order.items:
        items_out.append(TransferOrderItemResponse(
            id=item.id,
            transfer_order_id=item.transfer_order_id,
            batch_id=item.batch_id,
            quantity_requested=item.quantity_requested,
            quantity_shipped=item.quantity_shipped,
            quantity_received=item.quantity_received,
            reconciled=item.reconciled,
            batch_no=item.batch.batch_no if item.batch else None,
            medicine_name=item.batch.medicine.name if (item.batch and item.batch.medicine) else None,
            exp_date=item.batch.exp_date if item.batch else None
        ))

    return TransferOrderResponse(
        id=order.id,
        order_no=order.order_no,
        source_warehouse_id=order.source_warehouse_id,
        destination_warehouse_id=order.destination_warehouse_id,
        source_warehouse_name=order.source_warehouse.name if order.source_warehouse else None,
        destination_warehouse_name=order.destination_warehouse.name if order.destination_warehouse else None,
        status=order.status,
        created_by_user_id=order.created_by_user_id,
        creator_name=order.creator.full_name if order.creator else None,
        approved_by_user_id=order.approved_by_user_id,
        approver_name=order.approver.full_name if order.approver else None,
        dispatched_at=order.dispatched_at,
        received_at=order.received_at,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items_out
    )

@router.get("", response_model=List[TransferOrderResponse])
def list_transfer_orders(
    status_filter: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TransferOrder)
    if status_filter:
        query = query.filter(TransferOrder.status == status_filter)
    if warehouse_id:
        query = query.filter(
            (TransferOrder.source_warehouse_id == warehouse_id) |
            (TransferOrder.destination_warehouse_id == warehouse_id)
        )
    orders = query.order_by(TransferOrder.created_at.desc()).all()
    return [format_transfer_order(o) for o in orders]

@router.get("/{order_id}", response_model=TransferOrderResponse)
def get_transfer_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(TransferOrder).filter_by(id=order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Transfer order not found")
    return format_transfer_order(order)

@router.post("", response_model=TransferOrderResponse, status_code=status.HTTP_201_CREATED)
def create_transfer_order(
    payload: TransferOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.source_warehouse_id == payload.destination_warehouse_id:
        raise HTTPException(status_code=400, detail="Source and destination warehouses cannot be the same")

    source_wh = db.query(Warehouse).filter_by(id=payload.source_warehouse_id).first()
    dest_wh = db.query(Warehouse).filter_by(id=payload.destination_warehouse_id).first()
    if not source_wh or not dest_wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    # Generate sequence order number
    count = db.query(TransferOrder).count() + 1
    order_no = f"TR-{datetime.date.today().year}-{count:04d}"

    order = TransferOrder(
        order_no=order_no,
        source_warehouse_id=payload.source_warehouse_id,
        destination_warehouse_id=payload.destination_warehouse_id,
        status="Draft",
        created_by_user_id=current_user.id if current_user else 1,
        notes=payload.notes
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Attach order items
    for item_data in payload.items:
        batch = db.query(Batch).filter_by(id=item_data.batch_id).first()
        if not batch:
            continue

        # Check cold-chain compliance
        if batch.medicine.requires_cold_chain and not dest_wh.is_cold_storage:
            raise HTTPException(
                status_code=400,
                detail=f"Cold-chain violation: Medicine {batch.medicine.name} requires cold storage, but destination '{dest_wh.name}' lacks cold chain facilities."
            )

        order_item = TransferOrderItem(
            transfer_order_id=order.id,
            batch_id=batch.id,
            quantity_requested=item_data.quantity_requested,
            quantity_shipped=0,
            quantity_received=0,
            reconciled=False
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return format_transfer_order(order)

@router.post("/{order_id}/transition", response_model=TransferOrderResponse)
def transition_transfer_order(
    order_id: int,
    target_status: str, # "Pending Approval", "Dispatched", "Received & Reconciled", "Cancelled"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    State Machine Transition Handler:
    Draft -> Pending Approval -> Dispatched -> Received & Reconciled
    """
    order = db.query(TransferOrder).filter_by(id=order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Transfer order not found")

    current_status = order.status
    target = target_status.strip()

    # 1. Draft -> Pending Approval
    if current_status == "Draft" and target == "Pending Approval":
        order.status = "Pending Approval"

    # 2. Pending Approval -> Dispatched (requires approval, reserves stock)
    elif current_status == "Pending Approval" and target == "Dispatched":
        # Check stock availability at source warehouse and allocate
        for item in order.items:
            stock = db.query(StockLevel).filter_by(
                warehouse_id=order.source_warehouse_id,
                batch_id=item.batch_id
            ).first()

            if not stock or (stock.quantity - stock.allocated_quantity) < item.quantity_requested:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient available stock at source warehouse for batch {item.batch.batch_no}."
                )

            # Allocate stock and record shipped quantity
            stock.allocated_quantity += item.quantity_requested
            item.quantity_shipped = item.quantity_requested

        order.status = "Dispatched"
        order.approved_by_user_id = current_user.id if current_user else 1
        order.dispatched_at = datetime.datetime.utcnow()

    # 3. Dispatched -> Received & Reconciled (Atomic stock transfer & reconciliation)
    elif current_status == "Dispatched" and target == "Received & Reconciled":
        for item in order.items:
            qty = item.quantity_shipped or item.quantity_requested

            # Source deduction
            source_stock = db.query(StockLevel).filter_by(
                warehouse_id=order.source_warehouse_id,
                batch_id=item.batch_id
            ).first()

            if source_stock:
                source_stock.quantity = max(0, source_stock.quantity - qty)
                source_stock.allocated_quantity = max(0, source_stock.allocated_quantity - qty)

            # Destination addition
            dest_stock = db.query(StockLevel).filter_by(
                warehouse_id=order.destination_warehouse_id,
                batch_id=item.batch_id
            ).first()

            if dest_stock:
                dest_stock.quantity += qty
            else:
                # Create stock entry in destination warehouse
                dest_stock = StockLevel(
                    warehouse_id=order.destination_warehouse_id,
                    batch_id=item.batch_id,
                    quantity=qty,
                    allocated_quantity=0,
                    location_bin=f"RECV-DOCK/Z1"
                )
                db.add(dest_stock)

            item.quantity_received = qty
            item.reconciled = True

        order.status = "Received & Reconciled"
        order.received_at = datetime.datetime.utcnow()

    # 4. Cancelled Transition
    elif target == "Cancelled":
        if current_status == "Dispatched":
            # Release allocated stock back to source
            for item in order.items:
                stock = db.query(StockLevel).filter_by(
                    warehouse_id=order.source_warehouse_id,
                    batch_id=item.batch_id
                ).first()
                if stock:
                    stock.allocated_quantity = max(0, stock.allocated_quantity - item.quantity_requested)

        order.status = "Cancelled"

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state transition: Cannot transition from '{current_status}' to '{target}'."
        )

    order.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(order)
    return format_transfer_order(order)
