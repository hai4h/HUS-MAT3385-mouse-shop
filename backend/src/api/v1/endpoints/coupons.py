from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.coupon import CouponCreate, CouponUpdate, Coupon, CouponRestriction

router = APIRouter()

@router.post("/", response_model=Coupon)
async def create_coupon(
    coupon: CouponCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Start transaction
        conn.start_transaction()

        # Create coupon
        cursor.execute("""
            INSERT INTO coupons (
                code, name, description, discount_type,
                discount_value, min_order_value, max_discount_amount,
                start_date, end_date, total_usage_limit,
                user_usage_limit, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            coupon.code, coupon.name, coupon.description,
            coupon.discount_type, coupon.discount_value,
            coupon.min_order_value, coupon.max_discount_amount,
            coupon.start_date, coupon.end_date,
            coupon.total_usage_limit, coupon.user_usage_limit,
            coupon.is_active
        ))

        coupon_id = cursor.lastrowid

        # Add category restrictions if provided
        if coupon.category_restrictions:
            for restriction in coupon.category_restrictions:
                cursor.execute("""
                    INSERT INTO coupon_category_restrictions
                    (coupon_id, category, category_value)
                    VALUES (%s, %s, %s)
                """, (
                    coupon_id,
                    restriction['category'],
                    restriction['category_value']
                ))

        conn.commit()

        cursor.execute("SELECT * FROM coupons WHERE coupon_id = %s", (coupon_id,))
        return cursor.fetchone()

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.post("/verify", response_model=dict)
async def verify_coupon(
    code: str,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if coupon exists and is active
        cursor.execute("""
            SELECT * FROM coupons 
            WHERE code = %s AND is_active = 1
            AND start_date <= NOW() AND end_date >= NOW()
        """, (code,))
        
        coupon = cursor.fetchone()
        if not coupon:
            raise HTTPException(
                status_code=404,
                detail="Invalid or expired coupon"
            )

        # Check usage limits
        if coupon['total_usage_limit'] and coupon['used_count'] >= coupon['total_usage_limit']:
            raise HTTPException(
                status_code=400,
                detail="Coupon usage limit exceeded"
            )

        # Check user usage
        cursor.execute("""
            SELECT COUNT(*) as use_count
            FROM coupon_usage_history
            WHERE coupon_id = %s AND user_id = %s
        """, (coupon['coupon_id'], current_user['user_id']))
        
        user_usage = cursor.fetchone()
        if user_usage['use_count'] >= coupon['user_usage_limit']:
            raise HTTPException(
                status_code=400,
                detail="You have already used this coupon"
            )

        return {
            "valid": True,
            "coupon": coupon
        }

    finally:
        cursor.close()
        conn.close()

# Add other coupon endpoints
@router.get("/coupon_category_restrictions/{coupon_id}")
async def get_coupon_restrictions(
    coupon_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify coupon exists
        cursor.execute(
            "SELECT coupon_id FROM coupons WHERE coupon_id = %s",
            (coupon_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=404, 
                detail="Coupon not found"
            )

        # Get restrictions
        cursor.execute("""
            SELECT restriction_id, coupon_id, category, category_value
            FROM coupon_category_restrictions
            WHERE coupon_id = %s
        """, (coupon_id,))
        
        restrictions = cursor.fetchall()
        return restrictions

    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[Coupon])
async def list_coupons(current_user: dict = Depends(get_current_user)):
    """Get all coupons"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # First get all coupons
        cursor.execute("SELECT * FROM coupons ORDER BY created_at DESC")
        coupons = cursor.fetchall()
        
        # Then get restrictions for each coupon
        for coupon in coupons:
            cursor.execute("""
                SELECT category, category_value 
                FROM coupon_category_restrictions
                WHERE coupon_id = %s
            """, (coupon['coupon_id'],))
            
            restrictions = cursor.fetchall()
            coupon['category_restrictions'] = restrictions if restrictions else []
                
        return coupons
        
    finally:
        cursor.close()
        conn.close()

@router.put("/{coupon_id}", response_model=Coupon)
async def update_coupon(
    coupon_id: int,
    coupon: CouponUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update existing coupon (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Start transaction
        conn.start_transaction()

        # Update coupon
        cursor.execute("""
            UPDATE coupons SET
                code = %s,
                name = %s,
                description = %s,
                discount_type = %s,
                discount_value = %s,
                min_order_value = %s,
                max_discount_amount = %s,
                start_date = %s,
                end_date = %s,
                total_usage_limit = %s,
                user_usage_limit = %s,
                is_active = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE coupon_id = %s
        """, (
            coupon.code, coupon.name, coupon.description,
            coupon.discount_type, coupon.discount_value,
            coupon.min_order_value, coupon.max_discount_amount,
            coupon.start_date, coupon.end_date,
            coupon.total_usage_limit, coupon.user_usage_limit,
            coupon.is_active, coupon_id
        ))

        # Update category restrictions if provided
        if coupon.category_restrictions is not None:
            # Delete existing restrictions
            cursor.execute(
                "DELETE FROM coupon_category_restrictions WHERE coupon_id = %s",
                (coupon_id,)
            )
            
            # Add new restrictions
            for restriction in coupon.category_restrictions:
                cursor.execute("""
                    INSERT INTO coupon_category_restrictions 
                    (coupon_id, category, category_value)
                    VALUES (%s, %s, %s)
                """, (
                    coupon_id,
                    restriction['category'],
                    restriction['category_value']
                ))

        conn.commit()

        # Get updated coupon
        cursor.execute(
            "SELECT * FROM coupons WHERE coupon_id = %s",
            (coupon_id,)
        )
        return cursor.fetchone()

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()