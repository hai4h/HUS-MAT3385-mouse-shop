from pydantic import BaseModel, EmailStr, Field, model_validator

class UserBase(BaseModel):
    # Validate username length
    username: str =  Field(..., min_length=5, max_length=50)
    # Validate email format
    email: EmailStr

    @model_validator(mode='before')
    @classmethod
    def validate_gmail_email(cls, values):
        if isinstance(values, dict):
            email = values.get("email")
            if email and not str(email).endswith("@gmail.com"):
                raise ValueError("Email must end with @gmail.com")
        return values

class UserCreate(UserBase):
    # Validate password length
    password: str =  Field(min_length=6, max_length=255)

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str