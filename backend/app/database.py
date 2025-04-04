import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
from dotenv import load_dotenv

# Print Python version and module paths for debugging in Vercel
print(f"Python version: {sys.version}")
print(f"Motor version: {motor.motor_asyncio.__version__}")

load_dotenv()

# MongoDB connection settings
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "qblog")

# Global DB client and database instances
client = None
db = None

async def connect_to_mongo():
    """Connect to MongoDB and initialize global client and database objects."""
    global client, db
    
    try:
        print(f"Attempting to connect to MongoDB at {MONGO_URI.replace('//', '//****:****@')}")
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Verify connection works
        await client.admin.command('ping')
        
        db = client[DATABASE_NAME]
        print(f"Successfully connected to MongoDB database: {DATABASE_NAME}")
        
        # Creating indexes for faster queries
        try:
            await db.users.create_index("email", unique=True)
            await db.users.create_index("username", unique=True)
            await db.blogs.create_index("author_id")
            await db.blogs.create_index("created_at")
            print("Database indexes created/verified")
        except Exception as index_error:
            print(f"Warning - could not create indexes: {index_error}")
            # Don't fail startup if indexes can't be created
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        # In Vercel, we might want to continue even if DB connection fails initially
        # as it might be a temporary issue
        print("Will attempt to reconnect on first request")

async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

def get_database():
    """Return the database instance. Lazy-connects if needed."""
    global db, client
    
    # For Vercel serverless functions, we might need to reconnect
    if db is None and MONGO_URI:
        import asyncio
        try:
            print("Lazy-connecting to MongoDB...")
            client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            db = client[DATABASE_NAME]
            print("Lazy-connection successful")
        except Exception as e:
            print(f"Error during lazy-connection to MongoDB: {e}")
    
    return db 