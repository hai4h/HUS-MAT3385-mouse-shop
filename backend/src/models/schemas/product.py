from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Literal, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: str
    price: Decimal = Field(gt=0)
    stock_quantity: int = Field(gt=0)
    hand_size: Literal["small", "medium", "large"]
    grip_style: Literal["palm", "claw", "fingertip"]
    is_wireless: bool
    brand: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    product_id: int
    is_active: bool
    avg_user_rating: Optional[float] = None
    avg_expert_rating: Optional[float] = None
    total_reviews: int = 0
    created_at: datetime
    updated_at: datetime