import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Lesson, UserAccess, Notification
from app.schemas import LessonResponse, NotificationResponse, AccessStatusResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/student", tags=["Student"])

def check_user_access(user_id: int, db: Session) -> tuple[bool, bool, Optional[int], Optional[datetime.datetime]]:
    """
    Returns (is_active, is_unlimited, days_remaining, expires_at)
    """
    access = db.query(UserAccess).filter(UserAccess.user_id == user_id).order_by(UserAccess.id.desc()).first()
    if not access or not access.is_active:
        return False, False, None, None
    
    if access.expires_at is None:
        # Unlimited access
        return True, True, None, None
    
    now = datetime.datetime.utcnow()
    if access.expires_at <= now:
        # Expired! Auto update status in db
        access.is_active = False
        db.commit()
        return False, False, 0, access.expires_at
    
    time_diff = access.expires_at - now
    days_left = max(1, time_diff.days + (1 if time_diff.seconds > 0 else 0))
    return True, False, days_left, access.expires_at


@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_active, is_unlimited, days_remaining, expires_at = check_user_access(current_user.id, db)
    
    lessons = []
    if is_active or current_user.role == "admin":
        lessons = db.query(Lesson).order_by(Lesson.created_at.desc()).all()
    
    return {
        "access": {
            "is_active": is_active or current_user.role == "admin",
            "is_unlimited": is_unlimited if current_user.role != "admin" else True,
            "days_remaining": days_remaining if current_user.role != "admin" else None,
            "expires_at": expires_at.isoformat() if expires_at else None
        },
        "lessons": lessons
    }


@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifications


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Уведомление не найдено")
    note.is_read = True
    db.commit()
    return {"message": "Отмечено как прочитанное"}


@router.post("/notifications/read-all")
def mark_all_notifications_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "Все уведомления отмечены как прочитанные"}
