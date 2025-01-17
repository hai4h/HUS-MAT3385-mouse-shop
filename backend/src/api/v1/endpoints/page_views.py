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
    
@router.get("/stats")
async def get_overall_view_stats():
    try:
        with get_db_cursor() as cursor:
            # Get total views for each product
            cursor.execute("""
                SELECT 
                    p.product_id,
                    p.name as product_name,
                    COUNT(*) as total_views,
                    COUNT(DISTINCT pv.session_id) as unique_views,
                    DATE_FORMAT(MAX(pv.viewed_at), '%Y-%m-%d') as last_viewed_date,
                    IFNULL(
                        ROUND(
                            COUNT(*) * 100.0 / (
                                SELECT COUNT(*) 
                                FROM product_views
                            ), 2
                        ), 0
                    ) as view_percentage
                FROM products p
                LEFT JOIN product_views pv ON p.product_id = pv.product_id
                GROUP BY p.product_id, p.name
                ORDER BY total_views DESC
            """)
            
            product_stats = cursor.fetchall()

            # Get daily view trends
            cursor.execute("""
                SELECT 
                    DATE(viewed_at) as view_date,
                    COUNT(*) as daily_views,
                    COUNT(DISTINCT session_id) as unique_daily_views
                FROM product_views
                WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(viewed_at)
                ORDER BY view_date DESC
            """)
            
            daily_trends = cursor.fetchall()

            # Get hourly distribution
            cursor.execute("""
                SELECT 
                    HOUR(viewed_at) as hour_of_day,
                    COUNT(*) as views_count
                FROM product_views
                WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY HOUR(viewed_at)
                ORDER BY hour_of_day
            """)
            
            hourly_distribution = cursor.fetchall()

            # Get session analysis
            cursor.execute("""
                SELECT 
                    session_id,
                    COUNT(*) as views_in_session,
                    COUNT(DISTINCT product_id) as unique_products_viewed,
                    TIMESTAMPDIFF(MINUTE, 
                        MIN(viewed_at), 
                        MAX(viewed_at)
                    ) as session_duration_minutes
                FROM product_views
                GROUP BY session_id
                ORDER BY views_in_session DESC
                LIMIT 100
            """)
            
            session_analysis = cursor.fetchall()

            return {
                "product_stats": product_stats,
                "daily_trends": daily_trends,
                "hourly_distribution": hourly_distribution,
                "session_analysis": session_analysis,
                "summary": {
                    "total_views": sum(p['total_views'] for p in product_stats),
                    "total_unique_views": sum(p['unique_views'] for p in product_stats),
                    "average_views_per_product": round(
                        sum(p['total_views'] for p in product_stats) / 
                        len(product_stats) if product_stats else 0, 
                        2
                    ),
                    "most_viewed_product": max(
                        product_stats, 
                        key=lambda x: x['total_views']
                    ) if product_stats else None,
                    "least_viewed_product": min(
                        product_stats, 
                        key=lambda x: x['total_views']
                    ) if product_stats else None
                }
            }

    except Exception as e:
        logger.error(f"Error fetching view statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch view statistics"
        )

@router.get("/stats/product/{product_id}/trends")
async def get_product_view_trends(product_id: int):
    try:
        with get_db_cursor() as cursor:
            # Verify product exists
            cursor.execute(
                "SELECT name FROM products WHERE product_id = %s",
                (product_id,)
            )
            product = cursor.fetchone()
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {product_id} not found"
                )

            # Get daily trends
            cursor.execute("""
                SELECT 
                    DATE(viewed_at) as view_date,
                    COUNT(*) as total_views,
                    COUNT(DISTINCT session_id) as unique_views
                FROM product_views
                WHERE product_id = %s 
                AND viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(viewed_at)
                ORDER BY view_date
            """, (product_id,))
            
            daily_trends = cursor.fetchall()

            # Get hourly distribution
            cursor.execute("""
                SELECT 
                    HOUR(viewed_at) as hour_of_day,
                    COUNT(*) as views_count
                FROM product_views
                WHERE product_id = %s
                AND viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY HOUR(viewed_at)
                ORDER BY hour_of_day
            """, (product_id,))
            
            hourly_distribution = cursor.fetchall()

            # Get view context
            cursor.execute("""
                WITH ranked_products AS (
                    SELECT 
                        p2.product_id,
                        p2.name,
                        COUNT(*) as view_count,
                        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
                    FROM product_views pv1
                    JOIN product_views pv2 
                        ON pv1.session_id = pv2.session_id 
                        AND pv1.product_id != pv2.product_id
                    JOIN products p2 ON p2.product_id = pv2.product_id
                    WHERE pv1.product_id = %s
                    GROUP BY p2.product_id, p2.name
                )
                SELECT *
                FROM ranked_products
                WHERE rank <= 5
            """, (product_id,))
            
            related_products = cursor.fetchall()

            return {
                "product_name": product['name'],
                "daily_trends": daily_trends,
                "hourly_distribution": hourly_distribution,
                "related_products": related_products
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch product view trends"
        )