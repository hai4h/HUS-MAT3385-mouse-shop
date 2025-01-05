from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.review import (
    UserReviewCreate,
    UserReviewUpdate,
    ExpertReviewCreate,
    ExpertReviewUpdate,
    ProductReviews
)

router = APIRouter()

@router.get("/product/{product_id}/reviews", response_model=ProductReviews)
async def get_product_reviews(product_id: int):
    """Get all reviews (both user and expert) for a specific product"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get user reviews
        cursor.execute("""
            SELECT ur.*, u.username, od.product_id
            FROM user_reviews ur 
            JOIN order_details od ON ur.order_detail_id = od.order_detail_id
            JOIN users u ON u.user_id = od.order_id
            WHERE od.product_id = %s
            ORDER BY ur.created_at DESC
        """, (product_id,))
        user_reviews = cursor.fetchall()
        
        # Get expert reviews
        cursor.execute("""
            SELECT * FROM expert_reviews 
            WHERE product_id = %s 
            ORDER BY review_date DESC
        """, (product_id,))
        expert_reviews = cursor.fetchall()
        
        # Calculate average ratings
        user_avg = sum(r['rating'] for r in user_reviews) / len(user_reviews) if user_reviews else 0
        expert_avg = sum(r['rating'] for r in expert_reviews) / len(expert_reviews) if expert_reviews else 0
        
        return {
            "user_reviews": user_reviews,
            "expert_reviews": expert_reviews,
            "user_average": round(user_avg, 2),
            "expert_average": round(expert_avg, 2),
            "total_user_reviews": len(user_reviews),
            "total_expert_reviews": len(expert_reviews)
        }
    finally:
        cursor.close()
        conn.close()

@router.post("/product/{product_id}/user-review")
async def create_user_review(
    product_id: int,
    review: UserReviewCreate,
    current_user = Depends(get_current_user)
):
    """Create a new user review for a product"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if user has purchased the product
        cursor.execute("""
            SELECT od.order_detail_id 
            FROM order_details od
            JOIN orders o ON o.order_id = od.order_id
            WHERE o.user_id = %s AND od.product_id = %s
        """, (current_user["user_id"], product_id))
        
        order_detail = cursor.fetchone()
        if not order_detail:
            raise HTTPException(
                status_code=400,
                detail="You can only review products you have purchased"
            )
            
        # Check if user has already reviewed this product
        cursor.execute("""
            SELECT * FROM user_reviews ur
            WHERE ur.order_detail_id = %s
        """, (order_detail["order_detail_id"],))
        
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="You have already reviewed this product"
            )
            
        # Create review
        cursor.execute("""
            INSERT INTO user_reviews (order_detail_id, rating, comment)
            VALUES (%s, %s, %s)
        """, (order_detail["order_detail_id"], review.rating, review.comment))
        
        conn.commit()
        
        return {"message": "Review created successfully"}
        
    finally:
        cursor.close()
        conn.close()

@router.post("/product/{product_id}/expert-review")
async def create_expert_review(
    product_id: int,
    review: ExpertReviewCreate,
    current_user = Depends(get_current_user)
):
    """Create a new expert review (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create expert reviews")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            INSERT INTO expert_reviews 
            (product_id, expert_name, expert_title, rating, detailed_review, review_url)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            product_id,
            review.expert_name,
            review.expert_title,
            review.rating,
            review.detailed_review,
            review.review_url
        ))
        
        conn.commit()
        return {"message": "Expert review created successfully"}
        
    finally:
        cursor.close()
        conn.close()

@router.put("/user-review/{review_id}")
async def update_user_review(
    review_id: int,
    review: UserReviewUpdate,
    current_user = Depends(get_current_user)
):
    """Update a user review"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify review belongs to user
        cursor.execute("""
            SELECT ur.* FROM user_reviews ur
            JOIN order_details od ON ur.order_detail_id = od.order_detail_id
            JOIN orders o ON o.order_id = od.order_id
            WHERE ur.review_id = %s AND o.user_id = %s
        """, (review_id, current_user["user_id"]))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Review not found")
            
        # Update review
        cursor.execute("""
            UPDATE user_reviews 
            SET rating = %s, comment = %s
            WHERE review_id = %s
        """, (review.rating, review.comment, review_id))
        
        conn.commit()
        return {"message": "Review updated successfully"}
        
    finally:
        cursor.close()
        conn.close()

@router.put("/expert-review/{review_id}")
async def update_expert_review(
    review_id: int,
    review: ExpertReviewUpdate,
    current_user = Depends(get_current_user)
):
    """Update an expert review (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update expert reviews")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            UPDATE expert_reviews 
            SET expert_name = %s,
                expert_title = %s,
                rating = %s,
                detailed_review = %s,
                review_url = %s
            WHERE expert_review_id = %s
        """, (
            review.expert_name,
            review.expert_title,
            review.rating,
            review.detailed_review,
            review.review_url,
            review_id
        ))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Expert review not found")
            
        conn.commit()
        return {"message": "Expert review updated successfully"}
        
    finally:
        cursor.close()
        conn.close()