from sqlalchemy import create_engine, text
from app.config import settings
import traceback

# Modify URL to use psycopg2 (sync) instead of asyncpg
SYNC_DATABASE_URL = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")

def check_db_sync():
    try:
        with open("db_result.txt", "w", encoding="utf-8") as f:
            f.write(f"Connecting to (sync): {SYNC_DATABASE_URL}\n")
            
            engine = create_engine(SYNC_DATABASE_URL)
            with engine.connect() as conn:
                f.write("Connection successful!\n")
                result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
                tables = result.fetchall()
                f.write(f"Tables found: {[t[0] for t in tables]}\n")
            
            f.write("Done.\n")
            print("Done. Check db_result.txt")

    except Exception as e:
        with open("db_error.txt", "w", encoding="utf-8") as f:
            f.write(f"Connection failed: {e}\n")
            traceback.print_exc(file=f)
        print("Failed. Check db_error.txt")

if __name__ == "__main__":
    check_db_sync()
