from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ImageBase(BaseModel):
    product_id: int
    image_url: str
    is_primary: bool = False

class ImageCreate(ImageBase):
    pass

class ImageResponse(ImageBase):
    image_id: int
    created_at: datetime

class ProductImages(BaseModel):
    primary_image: Optional[ImageResponse]
    thumbnails: List[ImageResponse]
    total_images: int