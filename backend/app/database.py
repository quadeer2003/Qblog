import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

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
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DATABASE_NAME]
        print(f"Connected to MongoDB at {MONGO_URI}")
        
        # Creating indexes for faster queries
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        await db.blogs.create_index("author_id")
        await db.blogs.create_index("created_at")
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

def get_database():
    """Return the database instance."""
    return db 