from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId

from app.models.user import UserResponse
from app.database import get_database

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users(
    username: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Get users with optional filtering by username."""
    db = get_database()
    
    # Build query filter
    query = {}
    if username:
        query["username"] = username
    
    # Find users with pagination
    cursor = db.users.find(query).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # Format response
    formatted_users = []
    for user in users:
        formatted_user = {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"]
        }
        formatted_users.append(formatted_user)
    
    return formatted_users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get a specific user by ID."""
    db = get_database()
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Format response
    user_response = {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "created_at": user["created_at"]
    }
    
    return user_response 