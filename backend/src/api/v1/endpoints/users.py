from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.security import get_current_user, get_password_hash
from src.models.schemas.user import User, UserCreate, UserBase, ChangeEmailRequest, ChangePasswordRequest
from src.db.database import get_db_connection
from pydantic import BaseModel, EmailStr
from src.core.security import verify_password
from passlib.context import CryptContext
import random
import string

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

@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: int,
    user_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update user information"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify user exists
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s",
            (user_id,)
        )
        existing_user = cursor.fetchone()
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Define allowed fields based on role
        allowed_fields = ["full_name", "phone", "address"]
        if current_user["role"] == "admin":
            # Admin can update additional fields
            allowed_fields.extend(["username", "email"])

            # Check if username is being changed and verify uniqueness
            if "username" in user_update:
                cursor.execute(
                    "SELECT user_id FROM users WHERE username = %s AND user_id != %s",
                    (user_update["username"], user_id)
                )
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=400,
                        detail="Username already taken"
                    )

            # Check if email is being changed and verify uniqueness
            if "email" in user_update:
                cursor.execute(
                    "SELECT user_id FROM users WHERE email = %s AND user_id != %s",
                    (user_update["email"], user_id)
                )
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=400,
                        detail="Email already registered"
                    )

        # Filter out non-allowed fields
        update_data = {k: v for k, v in user_update.items() if k in allowed_fields}
        
        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No valid fields to update"
            )

        # Construct update query
        update_fields = ", ".join([f"{field} = %s" for field in update_data.keys()])
        values = list(update_data.values())
        values.append(user_id)  # for WHERE clause

        # Update user
        cursor.execute(
            f"""UPDATE users 
                SET {update_fields}, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s""",
            values
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=400,
                detail="Update failed"
            )

        conn.commit()

        # Return updated user
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s",
            (user_id,)
        )
        return cursor.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/change-email")
async def change_email(
    request: ChangeEmailRequest,
    current_user: dict = Depends(get_current_user)
):
    """Change user's email after password verification"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verify current password
        cursor.execute(
            "SELECT password_hash FROM users WHERE user_id = %s",
            (current_user["user_id"],)
        )
        user_data = cursor.fetchone()
        
        if not user_data or not verify_password(request.current_password, user_data["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Mật khẩu hiện tại không đúng"
            )

        # Check if new email already exists
        cursor.execute(
            "SELECT user_id FROM users WHERE email = %s AND user_id != %s",
            (request.new_email, current_user["user_id"])
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Email này đã được sử dụng"
            )

        # Update email
        cursor.execute(
            """UPDATE users 
               SET email = %s, updated_at = CURRENT_TIMESTAMP
               WHERE user_id = %s""",
            (request.new_email, current_user["user_id"])
        )
        conn.commit()

        return {"message": "Email đã được cập nhật thành công"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    """Change user's password after current password verification"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verify current password
        cursor.execute(
            "SELECT password_hash FROM users WHERE user_id = %s",
            (current_user["user_id"],)
        )
        user_data = cursor.fetchone()
        
        if not user_data or not verify_password(request.current_password, user_data["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Mật khẩu hiện tại không đúng"
            )

        # Validate new password
        if len(request.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="Mật khẩu mới phải có ít nhất 6 ký tự"
            )

        # Hash new password and update
        new_password_hash = get_password_hash(request.new_password)
        cursor.execute(
            """UPDATE users 
               SET password_hash = %s, updated_at = CURRENT_TIMESTAMP
               WHERE user_id = %s""",
            (new_password_hash, current_user["user_id"])
        )
        conn.commit()

        return {"message": "Mật khẩu đã được cập nhật thành công"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/{user_id}/preferences")
async def get_user_preferences(
    user_id: int,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            "SELECT * FROM user_preferences WHERE user_id = %s",
            (user_id,)
        )
        preferences = cursor.fetchone()
        return preferences or {}
    finally:
        cursor.close()
        conn.close()

@router.put("/{user_id}/preferences")
async def update_user_preferences(
    user_id: int,
    preferences: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Kiểm tra xem user đã có preferences chưa
        cursor.execute(
            "SELECT preference_id FROM user_preferences WHERE user_id = %s",
            (user_id,)
        )
        existing_preferences = cursor.fetchone()
        
        if existing_preferences:
            # UPDATE nếu đã tồn tại
            cursor.execute(
                """UPDATE user_preferences 
                   SET hand_size = %s,
                       grip_style = %s,
                       wireless_preferred = %s,
                       usage_type = %s,
                       updated_at = CURRENT_TIMESTAMP
                   WHERE user_id = %s""",
                (
                    preferences.get('hand_size'),
                    preferences.get('grip_style'),
                    preferences.get('wireless_preferred'),
                    preferences.get('usage_type'),
                    user_id
                )
            )
        else:
            # INSERT nếu chưa tồn tại
            cursor.execute(
                """INSERT INTO user_preferences 
                   (user_id, hand_size, grip_style, wireless_preferred, usage_type)
                   VALUES (%s, %s, %s, %s, %s)""",
                (
                    user_id,
                    preferences.get('hand_size'),
                    preferences.get('grip_style'),
                    preferences.get('wireless_preferred'),
                    preferences.get('usage_type')
                )
            )
        
        conn.commit()
        return {"message": "Preferences updated successfully"}
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.patch("/{user_id}/role", response_model=User)
async def update_user_role(
    user_id: int,
    role_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update user role (superadmin only)"""
    # Verify that the requester is superadmin (user_id = 1)
    if current_user["user_id"] != 1:
        raise HTTPException(
            status_code=403, 
            detail="Only superadmin can modify user roles"
        )

    # Prevent modifying superadmin's role
    if user_id == 1:
        raise HTTPException(
            status_code=403,
            detail="Cannot modify superadmin's role"
        )

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify target user exists
        cursor.execute(
            "SELECT user_id FROM users WHERE user_id = %s",
            (user_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        # Update user role
        cursor.execute(
            """UPDATE users 
               SET role = %s,
                   updated_at = CURRENT_TIMESTAMP
               WHERE user_id = %s""",
            (role_update["role"], user_id)
        )
        conn.commit()

        # Fetch and return updated user
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s",
            (user_id,)
        )
        updated_user = cursor.fetchone()
        return updated_user

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/{user_id}/reset-password", response_model=dict)
async def reset_user_password(
    user_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Reset user password (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can reset passwords"
        )

    if user_id == 1:  # Protect superadmin
        raise HTTPException(
            status_code=403,
            detail="Cannot reset superadmin password"
        )

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Generate a random password
        temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        hashed_password = get_password_hash(temp_password)

        # Update password
        cursor.execute(
            """UPDATE users 
               SET password_hash = %s,
                   updated_at = CURRENT_TIMESTAMP
               WHERE user_id = %s""",
            (hashed_password, user_id)
        )
        conn.commit()

        return {
            "message": "Password reset successful",
            "temp_password": temp_password
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()