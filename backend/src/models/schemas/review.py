from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class UserReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=10, max_length=1000)

class UserReviewCreate(UserReviewBase):
    pass

class UserReviewUpdate(UserReviewBase):
    pass

class UserReview(UserReviewBase):
    review_id: int
    username: str
    created_at: datetime
    updated_at: datetime

class ExpertReviewBase(BaseModel):
    expert_name: str
    expert_title: str
    rating: float = Field(..., ge=1, le=5)
    detailed_review: str = Field(..., min_length=100)
    review_url: Optional[str] = None

class ExpertReviewCreate(ExpertReviewBase):
    pass

class ExpertReviewUpdate(ExpertReviewBase):
    pass

class ExpertReview(ExpertReviewBase):
    expert_review_id: int
    review_date: datetime
    created_at: datetime

class ProductReviews(BaseModel):
    user_reviews: List[UserReview]
    expert_reviews: List[ExpertReview]
    user_average: float
    expert_average: float
    total_user_reviews: int
    total_expert_reviews: int