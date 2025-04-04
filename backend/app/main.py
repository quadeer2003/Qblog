from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import auth, blogs, users
from app.database import connect_to_mongo, close_mongo_connection
import os
import sys
import traceback
from mangum import Mangum

# Print Python information for debugging
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path}")

app = FastAPI(title="QBlog API", description="API for the QBlog blogging platform")

# Determine allowed origins from environment variable or use defaults
DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://qblog-nrzw.vercel.app"
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", DEFAULT_ORIGINS)
allowed_origins = ALLOWED_ORIGINS.split(",")

print(f"Configured CORS with allowed origins: {allowed_origins}")
print(f"Environment: {os.environ.get('VERCEL_ENV', 'development')}")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://(.*\.)?vercel\.app",  # Allow all Vercel subdomains
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Length", "Content-Type"],
    max_age=86400,  # 24 hours caching of preflight requests
)

# Add a custom middleware to handle OPTIONS requests more explicitly
@app.middleware("http")
async def options_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        # Handle CORS preflight requests
        headers = {
            "Access-Control-Allow-Origin": "*",  # This will be overwritten by the CORSMiddleware
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
            "Access-Control-Max-Age": "86400",
        }
        return JSONResponse(content={}, status_code=204, headers=headers)
    
    # For non-OPTIONS requests, proceed as normal
    return await call_next(request)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = str(exc)
    error_traceback = traceback.format_exc()
    print(f"Global exception: {error_detail}")
    print(f"Traceback: {error_traceback}")
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": error_detail}
    )

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["Blogs"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

# Event handlers for database connection
@app.on_event("startup")
async def startup_db_client():
    try:
        await connect_to_mongo()
        print("Database connection established successfully")
    except Exception as e:
        print(f"Error during startup: {e}")
        print(traceback.format_exc())

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "QBlog API is running"}

@app.get("/", tags=["Health"])
async def root():
    # More detailed health check for debugging
    packages_info = {
        "python_version": sys.version,
        "allowed_origins": allowed_origins,
    }
    
    try:
        import pymongo
        packages_info["pymongo_version"] = pymongo.__version__
    except:
        packages_info["pymongo_version"] = "Not available"
        
    try:
        import motor
        packages_info["motor_version"] = motor.__version__
    except:
        packages_info["motor_version"] = "Not available"
    
    return {
        "status": "ok", 
        "message": "QBlog API is running. CORS is properly configured for allowed origins.",
        "environment": os.environ.get("VERCEL_ENV", "development"),
        "packages": packages_info
    }

# Special route for OPTIONS preflight testing
@app.options("/{rest_of_path:path}")
async def options_handler(rest_of_path: str):
    return {}

# Handler for AWS Lambda
handler = Mangum(app) 