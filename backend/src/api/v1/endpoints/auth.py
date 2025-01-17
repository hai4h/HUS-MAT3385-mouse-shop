from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from src.core.security import verify_password, create_access_token
from src.db.database import get_db_connection
from src.models.schemas.auth import Token

router = APIRouter()

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE username = %s", (form_data.username,))
        user = cursor.fetchone()
        
        if not user or not verify_password(form_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        is_admin = user["role"] == "admin"
        access_token = create_access_token(
            data={"sub": user["username"], "user_id": user["user_id"], "role": user["role"]},
            is_admin=is_admin
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"]
        }
    finally:
        cursor.close()
        conn.close()