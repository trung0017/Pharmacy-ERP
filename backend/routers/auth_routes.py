from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Warehouse
from backend.schemas import UserResponse, UserCreate, LoginRequest, Token
from backend.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    require_roles
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=creds.email.lower()).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return UserResponse.model_validate(current_user)

@router.post("/switch-demo-role", response_model=Token)
def switch_demo_role(role: str, db: Session = Depends(get_db)):
    """Convenience helper for evaluating RBAC personas in demo environments."""
    valid_roles = ["SuperAdmin", "Pharmacist", "Warehouse_Staff", "Sales_Rep"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")

    user = db.query(User).filter_by(role=role).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"No user found for role {role}")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(require_roles(["SuperAdmin"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return [UserResponse.model_validate(u) for u in users]
