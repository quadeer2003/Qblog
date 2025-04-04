from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, blogs, users
from app.database import connect_to_mongo, close_mongo_connection
import os
from mangum import Mangum

app = FastAPI(title="QBlog API", description="API for the QBlog blogging platform")

# Determine allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174")
allowed_origins = ALLOWED_ORIGINS.split(",")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["Blogs"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

# Event handlers for database connection
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "QBlog API is running"}

# Handler for AWS Lambda
handler = Mangum(app) 