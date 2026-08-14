from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# --- Lesson Schemas ---
class LessonCreate(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    lesson_type: str = "video"  # "video", "file", "gallery"
    gallery_urls: Optional[str] = None

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    lesson_type: Optional[str] = None
    gallery_urls: Optional[str] = None

class LessonResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    video_url: Optional[str]
    lesson_type: str = "video"
    gallery_urls: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Access Schemas ---
class GrantAccessRequest(BaseModel):
    user_id: int
    duration_days: Optional[int] = None  # None or 0 means unlimited / бессрочно
    is_active: bool = True

class UserAccessResponse(BaseModel):
    id: int
    user_id: int
    expires_at: Optional[datetime]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AccessStatusResponse(BaseModel):
    is_active: bool
    is_unlimited: bool
    days_remaining: Optional[int]
    expires_at: Optional[datetime]

class UserWithAccessResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
    access: Optional[UserAccessResponse] = None

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Supplier Schemas ---
class SupplierCreate(BaseModel):
    name: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    contacts: Optional[str] = None
    category: str = "supplier"  # "supplier" or "illiquid"

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    contacts: Optional[str] = None
    category: Optional[str] = None

class SupplierResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    contacts: Optional[str] = None
    category: str
    created_at: datetime

    class Config:
        from_attributes = True
