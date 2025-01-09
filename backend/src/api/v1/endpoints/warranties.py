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

# Add other warranty endpoints