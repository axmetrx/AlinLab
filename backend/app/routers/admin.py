import datetime
import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Lesson, UserAccess, Notification
from app.schemas import LessonCreate, LessonUpdate, LessonResponse, GrantAccessRequest, UserAccessResponse
from app.auth import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.post("/upload")
def upload_file(file: UploadFile = File(...), admin: User = Depends(get_admin_user)):
    """
    Saves uploaded file from local computer to /uploads directory
    and returns accessible URL path.
    """
    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = os.path.join("uploads", unique_filename)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": file.filename
    }


@router.get("/users")
def get_students(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == "student").order_by(User.created_at.desc()).all()
    result = []
    
    now = datetime.datetime.utcnow()
    for user in users:
        access = db.query(UserAccess).filter(UserAccess.user_id == user.id).order_by(UserAccess.id.desc()).first()
        access_data = None
        if access:
            is_valid = access.is_active
            is_unlimited = access.expires_at is None
            days_left = None
            
            if access.expires_at and access.expires_at <= now:
                is_valid = False
            elif access.expires_at:
                time_diff = access.expires_at - now
                days_left = max(1, time_diff.days + (1 if time_diff.seconds > 0 else 0))
            
            access_data = {
                "id": access.id,
                "is_active": is_valid,
                "is_unlimited": is_unlimited,
                "expires_at": access.expires_at.isoformat() if access.expires_at else None,
                "days_remaining": days_left,
                "created_at": access.created_at.isoformat() if access.created_at else None
            }
        
        result.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "created_at": user.created_at.isoformat(),
            "access": access_data
        })
    
    return result


@router.post("/access")
def grant_access(req: GrantAccessRequest, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    now = datetime.datetime.utcnow()
    expires_at = None
    msg_duration = "бессрочно"

    if req.duration_days and req.duration_days > 0:
        expires_at = now + datetime.timedelta(days=req.duration_days)
        msg_duration = f"на {req.duration_days} дней"

    # Find existing access or create new
    access = db.query(UserAccess).filter(UserAccess.user_id == user.id).order_by(UserAccess.id.desc()).first()
    if not access:
        access = UserAccess(user_id=user.id)
        db.add(access)

    access.is_active = req.is_active
    access.expires_at = expires_at
    db.commit()

    # Notify student
    if req.is_active:
        notification_msg = f"Администратор открыл вам доступ к обучению {msg_duration}!"
    else:
        notification_msg = "Ваш доступ к обучению был приостановлен администратором."

    notification = Notification(
        user_id=user.id,
        message=notification_msg
    )
    db.add(notification)
    db.commit()

    return {"message": f"Доступ успешно обновлен для {user.full_name}"}


@router.post("/access/revoke/{user_id}")
def revoke_access(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    access = db.query(UserAccess).filter(UserAccess.user_id == user.id).order_by(UserAccess.id.desc()).first()
    if access:
        access.is_active = False
        db.commit()

    notification = Notification(
        user_id=user.id,
        message="Ваш доступ к урокам отменен администратором."
    )
    db.add(notification)
    db.commit()

    return {"message": "Доступ отменен"}


@router.delete("/users/{user_id}")
def delete_student(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.role == "student").first()
    if not user:
        raise HTTPException(status_code=404, detail="Ученик не найден")

    # Cleanly delete related access records and notifications first
    db.query(UserAccess).filter(UserAccess.user_id == user_id).delete(synchronize_session=False)
    db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
    
    db.delete(user)
    db.commit()
    return {"message": "Ученик успешно удален"}



# --- Lessons CRUD ---
@router.get("/lessons", response_model=List[LessonResponse])
def get_admin_lessons(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(Lesson).order_by(Lesson.created_at.desc()).all()


@router.post("/lessons", response_model=LessonResponse)
def create_lesson(lesson_in: LessonCreate, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    lesson = Lesson(
        title=lesson_in.title,
        description=lesson_in.description,
        video_url=lesson_in.video_url,
        lesson_type=lesson_in.lesson_type or "video",
        gallery_urls=lesson_in.gallery_urls
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    # Notify all active students about the new lesson
    students = db.query(User).filter(User.role == "student").all()
    type_label = "новый материал" if lesson.lesson_type != "video" else "новый видеоурок"
    for student in students:
        note = Notification(
            user_id=student.id,
            message=f"Вышел {type_label}: «{lesson.title}»! Посмотрите его прямо сейчас в личном кабинете."
        )
        db.add(note)
    db.commit()

    return lesson


@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(lesson_id: int, lesson_in: LessonUpdate, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")

    if lesson_in.title is not None:
        lesson.title = lesson_in.title
    if lesson_in.description is not None:
        lesson.description = lesson_in.description
    if lesson_in.video_url is not None:
        lesson.video_url = lesson_in.video_url
    if lesson_in.lesson_type is not None:
        lesson.lesson_type = lesson_in.lesson_type
    if lesson_in.gallery_urls is not None:
        lesson.gallery_urls = lesson_in.gallery_urls

    db.commit()
    db.refresh(lesson)
    return lesson



@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    
    db.delete(lesson)
    db.commit()
    return {"message": "Урок успешно удален"}
