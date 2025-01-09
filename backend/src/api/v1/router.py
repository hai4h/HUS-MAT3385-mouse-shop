from fastapi import APIRouter
from src.api.v1.endpoints import (
    auth, carts, users, products, reviews, orders,
    images, promotions, warranties, coupons
)

api_router = APIRouter()

api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(carts.router, prefix="/cart", tags=["cart"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(promotions.router, prefix="/promotions", tags=["promotions"])
api_router.include_router(warranties.router, prefix="/warranties", tags=["warranties"])
api_router.include_router(coupons.router, prefix="/coupons", tags=["coupons"])