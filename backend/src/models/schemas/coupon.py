from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional, Literal, List

class CouponBase(BaseModel):
    code: str
    name: str
    description: Optional[str]
    discount_type: Literal['percentage', 'fixed_amount']
    discount_value: Decimal
    min_order_value: Optional[Decimal]
    max_discount_amount: Optional[Decimal]
    start_date: datetime
    end_date: datetime
    total_usage_limit: Optional[int]
    user_usage_limit: int = 1
    is_active: bool = True

class CouponCreate(CouponBase):
    category_restrictions: Optional[List[dict]] = None

class CouponUpdate(CouponBase):
    category_restrictions: Optional[List[dict]] = None

class Coupon(CouponBase):
    coupon_id: int
    used_count: int
    created_at: datetime
    updated_at: datetime