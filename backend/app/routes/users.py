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
    
    try:
        # Find users with pagination - direct to_list approach instead of cursor
        users = await db.users.find(query, skip=skip, limit=limit).to_list(length=limit)
        
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
    except Exception as e:
        print(f"Error fetching users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get a specific user by ID."""
    db = get_database()
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception as e:
        print(f"Error with user ID format: {e}")
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