import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Lesson, UserAccess, Notification, Supplier, UserLessonProgress
from app.schemas import LessonResponse, NotificationResponse, AccessStatusResponse, SupplierResponse
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
    
    completed_lesson_ids = []
    lessons = []
    if is_active or current_user.role == "admin":
        lessons_raw = db.query(Lesson).order_by(Lesson.created_at.desc()).all()
        for l in lessons_raw:
            if getattr(l, 'lesson_type', None) is None:
                l.lesson_type = "video"
            if getattr(l, 'video_url', None) is None:
                l.video_url = ""
            if getattr(l, 'description', None) is None:
                l.description = ""
            if getattr(l, 'gallery_urls', None) is None:
                l.gallery_urls = ""
            lessons.append({
                "id": l.id,
                "title": l.title,
                "description": l.description or "",
                "video_url": l.video_url or "",
                "lesson_type": l.lesson_type or "video",
                "gallery_urls": l.gallery_urls or "",
                "module": l.module or "Модуль 1",
                "created_at": l.created_at.isoformat() if l.created_at else None
            })
        
        progress_records = db.query(UserLessonProgress).filter(UserLessonProgress.user_id == current_user.id).all()
        completed_lesson_ids = [p.lesson_id for p in progress_records]
    
    return {
        "access": {
            "is_active": is_active or current_user.role == "admin",
            "is_unlimited": is_unlimited if current_user.role != "admin" else True,
            "days_remaining": days_remaining if current_user.role != "admin" else None,
            "expires_at": expires_at.isoformat() if expires_at else None
        },
        "lessons": lessons,
        "completed_lesson_ids": completed_lesson_ids
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


@router.get("/suppliers", response_model=List[SupplierResponse])
def get_suppliers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_active, _, _, _ = check_user_access(current_user.id, db)
    if not is_active and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Доступ к материалам закрыт")
    
    return db.query(Supplier).order_by(Supplier.created_at.desc()).all()


@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_active, _, _, _ = check_user_access(current_user.id, db)
    if not is_active and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Доступ к материалам закрыт")

    # Check if already completed
    existing = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == current_user.id,
        UserLessonProgress.lesson_id == lesson_id
    ).first()
    
    if not existing:
        progress = UserLessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)
        db.commit()
    
    return {"message": "Урок успешно завершен"}


@router.post("/lessons/{lesson_id}/incomplete")
def incomplete_lesson(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_active, _, _, _ = check_user_access(current_user.id, db)
    if not is_active and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Доступ к материалам закрыт")

    existing = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == current_user.id,
        UserLessonProgress.lesson_id == lesson_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        
    return {"message": "Урок отмечен как незавершенный"}


