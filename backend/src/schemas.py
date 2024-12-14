from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional
from datetime import datetime
import re

# User models
class UserBase(BaseModel):
    email: str
    username: str
    full_name: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, v):
            raise ValueError('Invalid email format')
        return v
            
    @field_validator('username') 
    @classmethod
    def validate_username(cls, v):
        if not v.strip():
            raise ValueError('Username cannot be empty')
        if len(v.strip()) < 3:
            raise ValueError('Username must be at least 3 characters')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        if not v.replace("_", "").isalnum():
            raise ValueError('Username must be alphanumeric')
        return v.strip()

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError('Full name cannot be empty')
        if len(v) > 100:
            raise ValueError('Full name must be less than 100 characters') 
        return v.strip()

class UserCreate(UserBase):
   password: str
   
   @field_validator('password')
   @classmethod
   def validate_password(cls, v):
       if len(v.strip()) < 6:
           raise ValueError('Password must be at least 6 characters')
       return v.strip()

class User(UserBase):
    user_id: int
    role: str
    phone: str | None = None  # Optional fields
    address: str | None = None
    created_at: datetime
    updated_at: datetime
    
class UserPreferenceBase(BaseModel):
    hand_size: Literal["small", "medium", "large"]
    grip_style: Literal["palm", "claw", "fingertip"]
    wireless_preferred: bool
    usage_type: Literal["gaming", "office", "general"]

# Product models
class ProductBase(BaseModel):
    name: str
    description: str  # Bỏ Optional
    price: Decimal = Field(gt=0)
    stock_quantity: int = Field(gt=0)
    hand_size: Literal["small", "medium", "large"]  # Bỏ Optional
    grip_style: Literal["palm", "claw", "fingertip"]  # Bỏ Optional
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

class TechnicalSpec(BaseModel):
    dpi: int = Field(..., description="DPI value required")
    weight_g: float = Field(..., description="Weight in grams required")
    length_mm: float = Field(..., description="Length in mm required")
    width_mm: float = Field(..., description="Width in mm required")  
    height_mm: float = Field(..., description="Height in mm required")
    sensor_type: str = Field(..., description="Sensor type required")
    polling_rate: int = Field(..., description="Polling rate required")
    switch_type: str = Field(..., description="Switch type required")
    switch_durability: int = Field(..., description="Switch durability required")
    connectivity: str = Field(..., description="Connectivity type required")
    battery_life: int = Field(..., description="Battery life required") 
    cable_type: str = Field(..., description="Cable type required")
    rgb_lighting: bool = Field(..., description="RGB lighting status required")
    programmable_buttons: int = Field(..., description="Number of programmable buttons required")
    memory_profiles: str = Field(..., description="Memory profiles information required")

    class Config:
        json_schema_extra = {
            "example": {
                "dpi": 25600,
                "weight_g": 63,
                "length_mm": 125,
                "width_mm": 63.5,
                "height_mm": 40,
                "sensor_type": "HERO 25K",
                "polling_rate": 1000, 
                "switch_type": "Omron",
                "switch_durability": 50000000,
                "connectivity": "LIGHTSPEED Wireless",
                "battery_life": 70,
                "cable_type": "USB-C",
                "rgb_lighting": True,
                "programmable_buttons": 8,
                "memory_profiles": "5 onboard profiles"
            }
        }

# Auth models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None