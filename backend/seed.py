import asyncio
from app.database import engine, Base, SessionLocal

async def seed():
    async with SessionLocal() as session:
        # Create Tables (if not exist, though alembic should handle)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # Check if user exists
        from sqlalchemy.future import select
        result = await session.execute(select(User).where(User.email == "admin@example.com"))
        if result.scalars().first():
            print("User already exists.")
            return

        # Create User
        user = User(
            email="admin@example.com",
            name="Admin User",
            password_hash=get_password_hash("password123")
        )
        session.add(user)
        await session.flush() # get ID

        # Create Client
        client = Client(name="Acme Corp", user_id=user.id)
        session.add(client)
        await session.flush()

        # Create Project
        project = Project(name="Website Redesign", client_id=client.id, user_id=user.id, hourly_rate_override=50.0)
        session.add(project)
        await session.flush()
        
        # Create Board
        board = Board(name="Kanban Board", project_id=project.id)
        session.add(board)
        await session.flush()
        
        # Create Columns
        cols = ["Backlog", "Doing", "Review", "Done"]
        for i, name in enumerate(cols):
            session.add(Column(name=name, position=i, board_id=board.id))
            
        await session.commit()
        await session.commit()
        print("Seed complete: admin@example.com / password123")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
