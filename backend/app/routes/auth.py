from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
import uuid
from bson import ObjectId

from app.models.user import UserCreate, UserResponse, UserLogin
from app.utils.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.database import get_database

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user."""
    db = get_database()
    
    # Add debugging
    print(f"Registering user: {user_data.username}, {user_data.email}")
    
    # Check if email already exists
    if await db.users.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if await db.users.find_one({"username": user_data.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_id = ObjectId()
    
    # Ensure created_at exists
    created_at = datetime.utcnow()
    
    user_in_db = {
        "_id": user_id,
        "email": user_data.email,
        "username": user_data.username,
        "hashed_password": hashed_password,
        "created_at": created_at
    }
    
    try:
        await db.users.insert_one(user_in_db)
        print(f"User created with ID: {user_id}")
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    
    # Prepare the response
    user_response = {
        "id": str(user_id),
        "email": user_data.email,
        "username": user_data.username,
        "created_at": created_at
    }
    
    return user_response


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate a user and return a JWT token."""
    db = get_database()
    
    print(f"Login attempt for: {form_data.username}")
    
    # Find user by username or email
    user = await db.users.find_one({"email": form_data.username})
    if not user:
        print(f"User not found by email, trying username")
        user = await db.users.find_one({"username": form_data.username})
    
    if not user:
        print(f"User not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        print(f"Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Login successful for user: {user['username']}")
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(user["_id"])}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    return current_user 