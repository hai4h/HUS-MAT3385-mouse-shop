from pydantic import BaseModel
from typing import List
from decimal import Decimal

class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    cart_item_id: int
    cart_id: int
    name: str
    price: Decimal

class Cart(BaseModel):
    items: List[CartItem]
    total: Decimal