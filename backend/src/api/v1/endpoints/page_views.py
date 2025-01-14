from fastapi import APIRouter, Depends, HTTPException
from src.db.database import get_db_cursor
from pydantic import BaseModel

router = APIRouter()

class ProductViewCreate(BaseModel):
    product_id: int
    session_id: str

@router.post("/track")
async def track_product_view(product_view: ProductViewCreate):
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                INSERT INTO product_views 
                (product_id, session_id) 
                VALUES (%s, %s)
            """, (product_view.product_id, product_view.session_id))
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stats/{product_id}")
async def get_product_view_stats(product_id: int):
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_views, 
                    COUNT(DISTINCT session_id) as unique_views,
                    DATE(viewed_at) as view_date
                FROM product_views 
                WHERE product_id = %s
                GROUP BY view_date
                ORDER BY view_date
            """, (product_id,))
            
            return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))