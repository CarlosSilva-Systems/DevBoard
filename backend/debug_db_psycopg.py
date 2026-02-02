import sys
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings
import traceback

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def check_db():
    try:
        with open("db_psycopg_result.txt", "w", encoding="utf-8") as f:
            # Change scheme to psycopg
            db_url = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg")
            f.write(f"Connecting to: {db_url}\n")
            
            engine = create_async_engine(db_url)
            async with engine.connect() as conn:
                f.write("Connection successful!\n")
                result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
                tables = result.fetchall()
                f.write(f"Tables found: {[t[0] for t in tables]}\n")
            
            f.write("Done.\n")
            print("Done. Check db_psycopg_result.txt")

    except Exception as e:
        with open("db_psycopg_error.txt", "w", encoding="utf-8") as f:
            f.write(f"Connection failed: {e}\n")
            traceback.print_exc(file=f)
        print("Failed. Check db_psycopg_error.txt")

if __name__ == "__main__":
    asyncio.run(check_db())
