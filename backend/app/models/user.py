from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, value):
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return value


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, value):
        # Make validation simpler for debugging
        if len(value) < 6:
            raise ValueError('Password must be at least 6 characters')
        return value


class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(UserBase):
    id: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TokenData(BaseModel):
    user_id: str 