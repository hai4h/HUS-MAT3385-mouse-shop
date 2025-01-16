from fastapi import APIRouter, HTTPException
from src.db.database import get_db_cursor
from pydantic import BaseModel, field_validator
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ProductViewCreate(BaseModel):
    product_id: int
    session_id: str

    @field_validator('session_id')
    def validate_session_id(cls, v):
        if not v or not v.strip():
            raise ValueError('Session ID cannot be empty')
        if len(v) > 100:  # Match database column length
            raise ValueError('Session ID too long')
        return v.strip()

@router.post("/track")
async def track_product_view(product_view: ProductViewCreate):
    try:
        # First verify product exists
        with get_db_cursor() as cursor:
            cursor.execute(
                "SELECT product_id FROM products WHERE product_id = %s",
                (product_view.product_id,)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {product_view.product_id} not found"
                )
            
            # Then insert the view
            cursor.execute("""
                INSERT INTO product_views 
                (product_id, session_id) 
                VALUES (%s, %s)
            """, (product_view.product_id, product_view.session_id))
            
            return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking product view: {str(e)}")
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="Invalid product ID"
            )
        raise HTTPException(
            status_code=400,
            detail="Failed to track product view"
        )

@router.get("/stats/{product_id}")
async def get_product_view_stats(product_id: int):
    try:
        with get_db_cursor() as cursor:
            # First verify product exists
            cursor.execute(
                "SELECT product_id FROM products WHERE product_id = %s",
                (product_id,)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {product_id} not found"
                )
            
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_views,
                    COUNT(DISTINCT session_id) as unique_views,
                    DATE(viewed_at) as view_date
                FROM product_views
                WHERE product_id = %s
                GROUP BY view_date
                ORDER BY view_date DESC
                LIMIT 30
            """, (product_id,))
            
            return cursor.fetchall()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product view stats: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Failed to fetch view statistics"
        )