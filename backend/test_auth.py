from app.auth_utils import get_password_hash
import traceback

try:
    print("Testing hash...")
    pw = "password123"
    hashed = get_password_hash(pw)
    print(f"Hash success: {hashed[:10]}...")
except Exception:
    traceback.print_exc()
