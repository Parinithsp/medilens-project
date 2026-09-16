from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import (
    UserCreate, UserLogin, UserResponse, Token, 
    ForgotPasswordRequest, UserProfileUpdate, ChangePasswordRequest
)
from app.auth import get_password_hash, verify_password, create_access_token, require_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_pwd = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name or user_data.email.split("@")[0].title()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "id": user.id})
    return Token(access_token=token, user=UserResponse.from_orm(user))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    token = create_access_token(data={"sub": user.email, "id": user.id})
    return Token(access_token=token, user=UserResponse.from_orm(user))

@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(require_current_user)):
    return UserResponse.from_orm(user)

@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: UserProfileUpdate,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    user.full_name = data.full_name.strip()
    db.commit()
    db.refresh(user)
    return UserResponse.from_orm(user)

@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password."
        )
    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password changed successfully."}

@router.delete("/account")
def delete_account(
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    db.delete(user)
    db.commit()
    return {"message": "Account and all associated records have been permanently removed."}

@router.post("/demo", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """Provides 1-click instant login as a demo healthcare patient."""
    demo_email = "demo@medilens.health"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            email=demo_email,
            hashed_password=get_password_hash("DemoPass123!"),
            full_name="Dr. Eleanor Vance"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.email, "id": user.id})
    return Token(access_token=token, user=UserResponse.from_orm(user))

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Sends password reset instructions.
    To prevent account enumeration, always returns a success confirmation message.
    """
    user = db.query(User).filter(User.email == req.email).first()
    return {"message": "Password reset instructions have been sent."}
