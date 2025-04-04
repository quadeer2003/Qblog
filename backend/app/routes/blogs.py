from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.models.blog import BlogCreate, BlogUpdate, BlogResponse
from app.utils.auth import get_current_user
from app.database import get_database

router = APIRouter()


@router.post("/", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
async def create_blog(blog: BlogCreate, current_user: dict = Depends(get_current_user)):
    """Create a new blog post."""
    db = get_database()
    
    # Create blog object
    blog_id = ObjectId()
    now = datetime.utcnow()
    
    blog_in_db = {
        "_id": blog_id,
        "title": blog.title,
        "content": blog.content,
        "tags": blog.tags,
        "author_id": current_user["id"],
        "created_at": now,
        "updated_at": now
    }
    
    await db.blogs.insert_one(blog_in_db)
    
    # Add author username for response
    blog_response = {
        "id": str(blog_id),
        "title": blog.title,
        "content": blog.content,
        "tags": blog.tags,
        "author_id": current_user["id"],
        "author_username": current_user["username"],
        "created_at": now,
        "updated_at": now
    }
    
    return blog_response


@router.get("/", response_model=List[BlogResponse])
async def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    tag: Optional[str] = None,
    author_id: Optional[str] = None
):
    """Get blog posts with optional filtering."""
    db = get_database()
    
    # Build query filter
    query = {}
    if tag:
        query["tags"] = tag
    if author_id:
        query["author_id"] = author_id
    
    # Find blogs with pagination - avoid direct cursor usage
    try:
        # Add sorting in the find operation
        sort_option = [("created_at", -1)]
        blogs = await db.blogs.find(query, skip=skip, limit=limit, sort=sort_option).to_list(length=limit)
        
        # Get author usernames
        author_ids = {blog["author_id"] for blog in blogs}
        authors = {}
        
        if author_ids:
            # Use a different approach to fetch authors
            for aid in author_ids:
                author = await db.users.find_one({"_id": ObjectId(aid)})
                if author:
                    authors[str(author["_id"])] = author["username"]
        
        # Format response
        formatted_blogs = []
        for blog in blogs:
            blog["id"] = str(blog["_id"])
            del blog["_id"]
            blog["author_username"] = authors.get(blog["author_id"], "Unknown")
            formatted_blogs.append(blog)
        
        return formatted_blogs
    except Exception as e:
        print(f"Error fetching blogs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/{blog_id}", response_model=BlogResponse)
async def get_blog(blog_id: str):
    """Get a specific blog post by ID."""
    db = get_database()
    
    try:
        blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid blog ID format"
        )
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    # Get author username
    author = await db.users.find_one({"_id": ObjectId(blog["author_id"])})
    author_username = author["username"] if author else "Unknown"
    
    # Format response
    blog["id"] = str(blog["_id"])
    del blog["_id"]
    blog["author_username"] = author_username
    
    return blog


@router.put("/{blog_id}", response_model=BlogResponse)
async def update_blog(blog_id: str, blog_update: BlogUpdate, current_user: dict = Depends(get_current_user)):
    """Update a blog post."""
    db = get_database()
    
    try:
        blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid blog ID format"
        )
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    # Check if user is the author
    if blog["author_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own blogs"
        )
    
    # Update fields that are provided
    update_data = {k: v for k, v in blog_update.dict(exclude_unset=True).items()}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        await db.blogs.update_one(
            {"_id": ObjectId(blog_id)},
            {"$set": update_data}
        )
    
    # Get updated blog
    updated_blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    
    # Format response
    updated_blog["id"] = str(updated_blog["_id"])
    del updated_blog["_id"]
    updated_blog["author_username"] = current_user["username"]
    
    return updated_blog


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(blog_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a blog post."""
    db = get_database()
    
    try:
        blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid blog ID format"
        )
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    # Check if user is the author
    if blog["author_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own blogs"
        )
    
    # Delete the blog
    await db.blogs.delete_one({"_id": ObjectId(blog_id)})
    
    return None 