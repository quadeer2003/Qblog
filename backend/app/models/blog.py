from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class BlogBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    content: str = Field(..., min_length=10)
    tags: List[str] = Field(default=[])


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    content: Optional[str] = Field(None, min_length=10)
    tags: Optional[List[str]] = None


class BlogInDB(BlogBase):
    id: str
    author_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BlogResponse(BlogInDB):
    author_username: str
    
    class Config:
        from_attributes = True 