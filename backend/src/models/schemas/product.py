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

class ProductWithSpecs(Product):
    # Technical specs fields
    dpi: Optional[int] = None
    weight_g: Optional[float] = None
    length_mm: Optional[float] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    sensor_type: Optional[str] = None
    polling_rate: Optional[int] = None
    switch_type: Optional[str] = None
    switch_durability: Optional[int] = None
    connectivity: Optional[str] = None
    battery_life: Optional[int] = None
    cable_type: Optional[str] = None
    rgb_lighting: Optional[bool] = None
    programmable_buttons: Optional[int] = None
    memory_profiles: Optional[str] = None

    class Config:
        from_attributes = True