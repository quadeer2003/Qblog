from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional

from app.database import get_database
from app.models.user import User, UserOut, UserCreate, UserInDB
from app.core.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
)
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register(
    user_create: UserCreate, 
    request: Request,
    db: Database = Depends(get_database),
    x_internal_request: Optional[str] = Header(None)
):
    """
    Register a new user
    """
    # Log the registration attempt
    print(f"Registration attempt from {request.client.host}: {user_create.email}")
    print(f"Headers: {request.headers}")
    
    # If this is an internal request, we can skip some validation
    is_internal = x_internal_request == "true"
    print(f"Is internal request: {is_internal}")

    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_create.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate and create user
    try:
        # Hash the password
        hashed_password = get_password_hash(user_create.password)
        
        # Create UserInDB instance
        user_in_db = UserInDB(
            **user_create.dict(), 
            hashed_password=hashed_password
        )
        
        # Remove plain password before storing
        user_dict = user_in_db.dict()
        del user_dict["password"]  # Remove plain password
        
        # Insert into the database
        result = await db.users.insert_one(user_dict)
        
        # Return created user
        created_user = await db.users.find_one({"_id": result.inserted_id})
        if created_user:
            # Convert _id to string
            created_user["id"] = str(created_user["_id"])
            del created_user["_id"]
            del created_user["hashed_password"]  # Don't return the hashed password
            
            # Log success
            print(f"User registered successfully: {created_user['email']}")
            
            # Create response
            response = JSONResponse(
                status_code=status.HTTP_201_CREATED,
                content=created_user
            )
            
            # Add CORS headers if this is not an internal request
            if not is_internal:
                response.headers["Access-Control-Allow-Origin"] = "https://qblog-nrzw.vercel.app"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
                response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin"
                
            return response
        
        # If we got here, something went wrong
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )
    except DuplicateKeyError:
        # This could happen if there's a race condition
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except ValueError as e:
        # This would be raised by the model validation
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log the error
        print(f"Error during registration: {str(e)}")
        import traceback
        print(traceback.format_exc())
        
        # Return a generic error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Database = Depends(get_database)
):
    """
    Get access token for user
    """
    # Try to authenticate the user
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        # If authentication fails
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    # Return the token
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information
    """
    return current_user 