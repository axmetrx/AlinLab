from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserAccess, Notification
from app.schemas import UserRegister, UserLogin, Token, UserResponse, ProfileUpdate, PasswordChange
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже зарегистрирован"
        )
    
    hashed_pwd = hash_password(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role="student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize access record (default inactive)
    access = UserAccess(user_id=user.id, is_active=False, expires_at=None)
    db.add(access)

    # Welcome notification
    welcome_note = Notification(
        user_id=user.id,
        message="Добро пожаловать в Okademalin! Ваша учетная запись создана. Ожидайте активации доступа администратором."

    )
    db.add(welcome_note)
    db.commit()

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    
    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(profile_in: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if profile_in.email != current_user.email:
        existing = db.query(User).filter(User.email == profile_in.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Этот email уже занят другим пользователем")
        current_user.email = profile_in.email

    current_user.full_name = profile_in.full_name
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change-password")
def change_password(pwd_in: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Текущий пароль указан неверно")
    
    current_user.hashed_password = hash_password(pwd_in.new_password)
    db.commit()
    return {"message": "Пароль успешно изменен"}
