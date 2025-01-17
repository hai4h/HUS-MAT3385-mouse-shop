from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Literal

class PromotionBase(BaseModel):
    name: str
    description: Optional[str]
    discount_type: Literal['percentage', 'fixed_amount']
    discount_value: Decimal
    start_date: datetime
    end_date: datetime
    min_order_value: Optional[Decimal]
    max_discount_amount: Optional[Decimal]
    usage_limit: Optional[int]
    is_active: bool = True

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(PromotionBase):
    pass

class Promotion(PromotionBase):
    promotion_id: int
    used_count: int
    created_at: datetime
    updated_at: datetime

class ProductPromotionAssignment(BaseModel):
    promotion_id: int
    product_ids: List[int]