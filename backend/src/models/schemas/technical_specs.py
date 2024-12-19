from pydantic import BaseModel, Field

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