from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.promotion import PromotionCreate, PromotionUpdate, Promotion, ProductPromotionAssignment

router = APIRouter()

@router.post("/", response_model=Promotion)
async def create_promotion(
    promotion: PromotionCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            INSERT INTO promotions (
                name, description, discount_type, discount_value,
                start_date, end_date, min_order_value, max_discount_amount,
                usage_limit, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            promotion.name, promotion.description, promotion.discount_type,
            promotion.discount_value, promotion.start_date, promotion.end_date,
            promotion.min_order_value, promotion.max_discount_amount,
            promotion.usage_limit, promotion.is_active
        ))
        conn.commit()

        promotion_id = cursor.lastrowid
        cursor.execute("SELECT * FROM promotions WHERE promotion_id = %s", (promotion_id,))
        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[Promotion])
async def list_promotions():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM promotions ORDER BY created_at DESC")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


@router.post("/products/assign", response_model=dict)
async def assign_promotion_to_products(
    assignment: ProductPromotionAssignment,
    current_user: dict = Depends(get_current_user)
):
    """Assign a promotion to specific products"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Start transaction
        conn.start_transaction()

        # Verify promotion exists and is active
        cursor.execute(
            "SELECT * FROM promotions WHERE promotion_id = %s AND is_active = 1",
            (assignment.promotion_id,)
        )
        promotion = cursor.fetchone()
        if not promotion:
            raise HTTPException(
                status_code=404,
                detail="Promotion not found or inactive"
            )

        # Verify all products exist
        for product_id in assignment.product_ids:
            cursor.execute(
                "SELECT product_id FROM products WHERE product_id = %s",
                (product_id,)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=404,
                    detail=f"Product with id {product_id} not found"
                )

        # Remove existing promotion assignments for these products
        cursor.execute(
            """DELETE FROM product_promotions 
               WHERE product_id IN ({})""".format(
                ','.join(['%s'] * len(assignment.product_ids))
            ),
            assignment.product_ids
        )

        # Insert new promotion assignments
        for product_id in assignment.product_ids:
            cursor.execute(
                """INSERT INTO product_promotions (product_id, promotion_id)
                   VALUES (%s, %s)""",
                (product_id, assignment.promotion_id)
            )

        conn.commit()
        return {
            "message": "Promotion assigned successfully",
            "promotion_id": assignment.promotion_id,
            "product_ids": assignment.product_ids
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/products/{product_id}", response_model=List[dict])
async def get_product_promotions(product_id: int):
    """Get all active promotions for a specific product"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT p.* 
            FROM promotions p
            JOIN product_promotions pp ON p.promotion_id = pp.promotion_id
            WHERE pp.product_id = %s
            AND p.is_active = 1
            AND p.start_date <= NOW()
            AND p.end_date >= NOW()
        """, (product_id,))
        
        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()

@router.delete("/products/{product_id}/promotions/{promotion_id}")
async def remove_promotion_from_product(
    product_id: int,
    promotion_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Remove a promotion from a specific product"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            DELETE FROM product_promotions
            WHERE product_id = %s AND promotion_id = %s
        """, (product_id, promotion_id))
        
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Promotion assignment not found"
            )

        return {"message": "Promotion removed from product successfully"}

    finally:
        cursor.close()
        conn.close()

@router.put("/{promotion_id}", response_model=Promotion)
async def update_promotion(
    promotion_id: int,
    promotion: PromotionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an existing promotion"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verify promotion exists
        cursor.execute(
            "SELECT * FROM promotions WHERE promotion_id = %s",
            (promotion_id,)
        )
        existing_promotion = cursor.fetchone()
        if not existing_promotion:
            raise HTTPException(
                status_code=404,
                detail="Promotion not found"
            )

        # Update promotion
        cursor.execute("""
            UPDATE promotions 
            SET name = %s, 
                description = %s, 
                discount_type = %s, 
                discount_value = %s,
                start_date = %s, 
                end_date = %s, 
                min_order_value = %s, 
                max_discount_amount = %s,
                usage_limit = %s, 
                is_active = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE promotion_id = %s
        """, (
            promotion.name, 
            promotion.description, 
            promotion.discount_type,
            promotion.discount_value, 
            promotion.start_date, 
            promotion.end_date,
            promotion.min_order_value, 
            promotion.max_discount_amount,
            promotion.usage_limit, 
            promotion.is_active,
            promotion_id
        ))
        conn.commit()

        # Fetch and return updated promotion
        cursor.execute(
            "SELECT * FROM promotions WHERE promotion_id = %s", 
            (promotion_id,)
        )
        updated_promotion = cursor.fetchone()
        return updated_promotion

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()