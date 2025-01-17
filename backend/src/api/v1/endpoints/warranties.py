from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.warranty import (
    WarrantyPolicyCreate, WarrantyPolicy,
    WarrantyClaimCreate, WarrantyClaim
)

router = APIRouter()

@router.post("/policies", response_model=WarrantyPolicy)
async def create_warranty_policy(
    policy: WarrantyPolicyCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            INSERT INTO warranty_policies (
                product_id, warranty_period, warranty_type,
                warranty_description, warranty_conditions
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            policy.product_id, policy.warranty_period,
            policy.warranty_type, policy.warranty_description,
            policy.warranty_conditions
        ))
        conn.commit()

        policy_id = cursor.lastrowid
        cursor.execute(
            "SELECT * FROM warranty_policies WHERE warranty_id = %s",
            (policy_id,)
        )
        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

@router.post("/claims", response_model=WarrantyClaim)
async def create_warranty_claim(
    claim: WarrantyClaimCreate,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verify the order belongs to the user
        cursor.execute("""
            SELECT o.user_id 
            FROM order_details od
            JOIN orders o ON od.order_id = o.order_id
            WHERE od.order_detail_id = %s
        """, (claim.order_detail_id,))
        
        order = cursor.fetchone()
        if not order or order['user_id'] != current_user['user_id']:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to create warranty claim for this order"
            )

        cursor.execute("""
            INSERT INTO warranty_claims (
                order_detail_id, user_id, issue_description,
                status, resolution_notes
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            claim.order_detail_id, current_user['user_id'],
            claim.issue_description, 'pending', claim.resolution_notes
        ))
        conn.commit()

        claim_id = cursor.lastrowid
        cursor.execute(
            "SELECT * FROM warranty_claims WHERE claim_id = %s",
            (claim_id,)
        )
        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

@router.get("/claims", response_model=List[dict])
async def list_warranty_claims(
    current_user: dict = Depends(get_current_user)
):
    """Get all warranty claims (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                wc.claim_id, 
                wc.order_detail_id, 
                wc.user_id, 
                wc.issue_description, 
                wc.status, 
                wc.claim_date,
                u.full_name as customer_name,
                p.name as product_name
            FROM warranty_claims wc
            JOIN order_details od ON wc.order_detail_id = od.order_detail_id
            JOIN products p ON od.product_id = p.product_id
            JOIN users u ON wc.user_id = u.user_id
            ORDER BY wc.claim_date DESC
        """)
        claims = cursor.fetchall()
        return claims

    finally:
        cursor.close()
        conn.close()

@router.get("/policies", response_model=List[dict])
async def list_warranty_policies(
    current_user: dict = Depends(get_current_user)
):
    """Get all warranty policies (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                wp.warranty_id, 
                wp.product_id, 
                wp.warranty_period, 
                wp.warranty_type,
                wp.warranty_description,
                wp.warranty_conditions,
                p.name as product_name
            FROM warranty_policies wp
            JOIN products p ON wp.product_id = p.product_id
            ORDER BY wp.created_at DESC
        """)
        policies = cursor.fetchall()
        return policies

    finally:
        cursor.close()
        conn.close()

@router.get("/order/{order_id}/policies", response_model=List[dict])
async def get_order_warranty_policies(
    order_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get warranty policies for all products in a specific order"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verify the order belongs to the current user
        cursor.execute(
            "SELECT * FROM orders WHERE order_id = %s AND user_id = %s",
            (order_id, current_user['user_id'])
        )
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to view this order's warranty details"
            )

        # Fetch warranty details for all products in the order
        cursor.execute("""
            SELECT 
                od.product_id,
                p.name AS product_name,
                wp.warranty_period,
                wp.warranty_type,
                wp.warranty_description,
                wp.warranty_conditions,
                o.order_date,
                DATE_ADD(o.order_date, INTERVAL wp.warranty_period MONTH) AS warranty_end_date,
                CASE 
                    WHEN CURRENT_DATE <= DATE_ADD(o.order_date, INTERVAL wp.warranty_period MONTH) 
                    THEN 'Valid' 
                    ELSE 'Expired' 
                END AS warranty_status
            FROM order_details od
            JOIN orders o ON od.order_id = o.order_id
            JOIN products p ON od.product_id = p.product_id
            LEFT JOIN warranty_policies wp ON p.product_id = wp.product_id
            WHERE o.order_id = %s
        """, (order_id,))
        
        warranty_policies = cursor.fetchall()
        
        return warranty_policies

    finally:
        cursor.close()
        conn.close()

@router.get("/policies/{product_id}", response_model=dict)
async def get_product_warranty_policy(
    product_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get warranty policy for a specific product"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                wp.warranty_period,
                wp.warranty_type,
                wp.warranty_description,
                wp.warranty_conditions,
                p.name AS product_name
            FROM warranty_policies wp
            JOIN products p ON wp.product_id = p.product_id
            WHERE wp.product_id = %s
        """, (product_id,))
        
        policy = cursor.fetchone()
        
        if not policy:
            raise HTTPException(
                status_code=404, 
                detail="No warranty policy found for this product"
            )
        
        return policy

    finally:
        cursor.close()
        conn.close()

@router.get("/orders", response_model=List[dict])
async def get_user_orders(
    current_user: dict = Depends(get_current_user)
):
    """Get all orders for the current user"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                o.order_id, 
                o.order_date, 
                GROUP_CONCAT(p.name SEPARATOR ', ') as products
            FROM orders o
            JOIN order_details od ON o.order_id = od.order_id
            JOIN products p ON od.product_id = p.product_id
            WHERE o.user_id = %s
            GROUP BY o.order_id, o.order_date
            ORDER BY o.order_date DESC
        """, (current_user['user_id'],))
        
        orders = cursor.fetchall()
        return orders

    finally:
        cursor.close()
        conn.close()

@router.patch("/claims/{claim_id}/status")
async def update_warranty_claim_status(
    claim_id: int,
    status_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update warranty claim status (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verify claim exists
        cursor.execute(
            "SELECT * FROM warranty_claims WHERE claim_id = %s", 
            (claim_id,)
        )
        claim = cursor.fetchone()
        
        if not claim:
            raise HTTPException(
                status_code=404, 
                detail="Warranty claim not found"
            )

        # Validate status
        valid_statuses = ['pending', 'processing', 'completed', 'rejected']
        new_status = status_update.get('status')
        
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )

        # Update status
        cursor.execute("""
            UPDATE warranty_claims 
            SET status = %s, 
                resolved_date = CASE 
                    WHEN %s IN ('completed', 'rejected') THEN CURRENT_TIMESTAMP 
                    ELSE NULL 
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE claim_id = %s
        """, (new_status, new_status, claim_id))
        
        conn.commit()

        # Fetch updated claim
        cursor.execute(
            "SELECT * FROM warranty_claims WHERE claim_id = %s", 
            (claim_id,)
        )
        updated_claim = cursor.fetchone()

        return updated_claim

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/claims/user", response_model=List[dict])
async def get_user_warranty_claims(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                wc.claim_id, 
                wc.order_detail_id, 
                wc.issue_description, 
                wc.status, 
                wc.claim_date,
                p.name as product_name
            FROM warranty_claims wc
            JOIN order_details od ON wc.order_detail_id = od.order_detail_id
            JOIN products p ON od.product_id = p.product_id
            WHERE wc.user_id = %s
            ORDER BY wc.claim_date DESC
        """, (current_user['user_id'],))
        
        claims = cursor.fetchall()
        return claims

    finally:
        cursor.close()
        conn.close()