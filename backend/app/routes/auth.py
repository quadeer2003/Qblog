from fastapi import APIRouter, Depends, HTTPException, status, Request, Header, Query
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime

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
                response.headers["Access-Control-Allow-Methods"] = "GET,OPTIONS,PATCH,DELETE,POST,PUT"
                response.headers["Access-Control-Allow-Headers"] = "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Origin"
                
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

@router.get("/fallback")
async def auth_fallback(
    request: Request,
    mode: str = Query(...),
    username: str = Query(None),
    email: str = Query(None),
    password: str = Query(None),
    db: Database = Depends(get_database)
):
    """
    Fallback endpoint that handles authentication via GET requests
    This is a workaround for CORS issues when POST requests fail
    
    Parameters:
    - mode: 'register' or 'login'
    - username: Username for registration, or email/username for login
    - email: Email for registration
    - password: Password for login or registration
    """
    print(f"Fallback auth request: {mode} from {request.client.host}")
    print(f"Request headers: {request.headers}")
    
    # Create response with CORS headers
    async def create_cors_response(content, status_code=200):
        response = JSONResponse(
            content=content,
            status_code=status_code
        )
        response.headers["Access-Control-Allow-Origin"] = "https://qblog-nrzw.vercel.app"
        response.headers["Access-Control-Allow-Methods"] = "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        response.headers["Access-Control-Allow-Headers"] = "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Origin"
        return response
    
    try:
        if mode == "register":
            # Validate inputs
            if not username or not email or not password:
                return await create_cors_response(
                    {"detail": "Missing required fields for registration"},
                    status.HTTP_400_BAD_REQUEST
                )
            
            # Check if email already exists
            existing_user = await db.users.find_one({"email": email})
            if existing_user:
                return await create_cors_response(
                    {"detail": "Email already registered"},
                    status.HTTP_400_BAD_REQUEST
                )
            
            # Check if username already exists
            existing_user = await db.users.find_one({"username": username})
            if existing_user:
                return await create_cors_response(
                    {"detail": "Username already taken"},
                    status.HTTP_400_BAD_REQUEST
                )
            
            # Create user
            hashed_password = get_password_hash(password)
            
            user_dict = {
                "username": username,
                "email": email,
                "hashed_password": hashed_password,
                "created_at": datetime.utcnow()
            }
            
            # Insert into the database
            result = await db.users.insert_one(user_dict)
            
            # Prepare response
            created_user = await db.users.find_one({"_id": result.inserted_id})
            if created_user:
                response_data = {
                    "id": str(created_user["_id"]),
                    "username": created_user["username"],
                    "email": created_user["email"],
                    "created_at": created_user["created_at"]
                }
                
                print(f"User registered successfully via fallback: {email}")
                return await create_cors_response(response_data, status.HTTP_201_CREATED)
            
            # If we got here, something went wrong
            return await create_cors_response(
                {"detail": "Error creating user"},
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        elif mode == "login":
            # Validate inputs
            if not username or not password:
                return await create_cors_response(
                    {"detail": "Missing required fields for login"},
                    status.HTTP_400_BAD_REQUEST
                )
            
            # Try to authenticate the user
            user = await authenticate_user(username, password, db)
            if not user:
                return await create_cors_response(
                    {"detail": "Incorrect email or password"},
                    status.HTTP_401_UNAUTHORIZED
                )
            
            # Create access token
            access_token = create_access_token(data={"sub": user["id"]})
            
            # Return the token
            return await create_cors_response({
                "access_token": access_token,
                "token_type": "bearer"
            })
        
        else:
            return await create_cors_response(
                {"detail": f"Invalid mode: {mode}"},
                status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        print(f"Error in fallback auth: {str(e)}")
        import traceback
        print(traceback.format_exc())
        
        return await create_cors_response(
            {"detail": f"Internal server error: {str(e)}"},
            status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 