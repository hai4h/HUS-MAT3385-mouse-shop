from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal

class WarrantyPolicyBase(BaseModel):
    product_id: int
    warranty_period: int
    warranty_type: str
    warranty_description: str
    warranty_conditions: Optional[str]

class WarrantyPolicyCreate(WarrantyPolicyBase):
    pass

class WarrantyPolicyUpdate(WarrantyPolicyBase):
    pass

class WarrantyPolicy(WarrantyPolicyBase):
    warranty_id: int
    created_at: datetime
    updated_at: datetime

class WarrantyClaimBase(BaseModel):
    order_detail_id: int
    issue_description: str
    status: Literal['pending', 'processing', 'completed', 'rejected']
    resolution_notes: Optional[str]

class WarrantyClaimCreate(WarrantyClaimBase):
    pass

class WarrantyClaimUpdate(WarrantyClaimBase):
    pass

class WarrantyClaim(WarrantyClaimBase):
    claim_id: int
    user_id: int
    claim_date: datetime
    resolved_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime