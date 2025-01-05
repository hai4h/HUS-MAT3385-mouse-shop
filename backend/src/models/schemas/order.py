from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str = Field(..., min_length=10)
    
class OrderItemResponse(OrderItemCreate):
    unit_price: Decimal
    subtotal: Decimal
    product_name: str

class OrderResponse(BaseModel):
    order_id: int
    user_id: int
    total_amount: Decimal
    status: str
    shipping_address: str
    products: str  # Comma-separated list of product names
    order_date: datetime
    updated_at: datetime