import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, run_db_migrations
run_db_migrations(engine)
print("Migrations finished successfully!")
