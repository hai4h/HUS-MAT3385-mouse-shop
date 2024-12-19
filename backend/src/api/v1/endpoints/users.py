from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.security import get_current_user, get_password_hash
from src.models.schemas.user import User, UserCreate
from src.db.database import get_db_connection

router = APIRouter()

@router.post("/", response_model=User)
async def create_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "SELECT * FROM users WHERE email = %s OR username = %s",
            (user.email, user.username)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Email or username already registered"
            )
        
        hashed_password = get_password_hash(user.password)
        cursor.execute(
            """INSERT INTO users 
               (username, email, password_hash, full_name, role)
               VALUES (%s, %s, %s, %s, %s)""",
            (user.username, user.email, hashed_password, user.full_name, "user")
        )
        conn.commit()
        
        new_user_id = cursor.lastrowid
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s",
            (new_user_id,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[User])
async def list_users(current_user: User = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int, current_user: User = Depends(get_current_user)):  

    if current_user["role"] != "admin" and current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user