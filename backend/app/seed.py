import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Lesson, UserAccess, Notification
from app.auth import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

def seed_data():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@alinlab.ru").first()
        if not admin:
            admin = User(
                email="admin@alinlab.ru",
                hashed_password=hash_password("adminpassword"),
                full_name="Администратор Okademalin",
                role="admin"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            logger.info("Admin user created: admin@alinlab.ru / adminpassword")

        # Check if student exists
        student = db.query(User).filter(User.email == "student@alinlab.ru").first()
        if not student:
            student = User(
                email="student@alinlab.ru",
                hashed_password=hash_password("studentpassword"),
                full_name="Айжамал Бакытова",
                role="student"
            )
            db.add(student)
            db.commit()
            db.refresh(student)

            # Inactive initial access for demo student
            access = UserAccess(user_id=student.id, is_active=False)
            db.add(access)

            # Initial notification
            welcome = Notification(
                user_id=student.id,
                message="Добро пожаловать в Okademalin! Ожидайте активации доступа администратором."
            )
            db.add(welcome)
            logger.info("Student user created: student@alinlab.ru / studentpassword")

        # Check lessons count
        lessons_count = db.query(Lesson).count()
        if lessons_count == 0:
            demo_lessons = [
                Lesson(
                    title="Урок 1. Введение в курс: Гармония и Восстановление",
                    description="Вводное занятие. Мы разберем основные принципы баланса, ресурсных состояний и построения личной практики.",
                    video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                ),
                Lesson(
                    title="Урок 2. Практики глубокой релаксации и снижения стресса",
                    description="Пошаговые дыхательные техники и упражнения для снятия эмоционального и физического напряжения после насыщенного дня.",
                    video_url="https://www.youtube.com/watch?v=5qap5aO4i9A"
                ),
                Lesson(
                    title="Урок 3. Настройка ежедневного ритма и забота о себе",
                    description="Формирование полезных утренних и вечерних ритуалов, сохранение энергии и управление временем без выгорания.",
                    video_url="https://www.youtube.com/watch?v=3JZ_D3ELwOQ"
                )
            ]
            db.add_all(demo_lessons)
            logger.info("Added 3 demo lessons.")

        db.commit()
        logger.info("Database seeding completed successfully!")

    except Exception as e:
        logger.error(f"Seeding error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
