from pydantic import BaseModel, Field, field_validator
from typing import List, Literal, Optional
from datetime import datetime
from decimal import Decimal

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str = Field(..., min_length=10)
    note: Optional[str] = None
    coupon_id: Optional[int] = None
    
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

class OrderStatusUpdate(BaseModel):
    status: Literal['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    @field_validator('status')
    def validate_status(cls, v):
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if v not in valid_statuses:
            raise ValueError(f'Invalid status. Must be one of: {", ".join(valid_statuses)}')
        return v
    
class OrderStatusUpdateSchema(BaseModel):
    status: Literal['pending', 'processing', 'shipped', 'delivered', 'cancelled']