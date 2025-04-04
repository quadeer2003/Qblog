# QBlog - Full Stack Blogging Platform

QBlog is a modern blogging platform built with React, FastAPI, and MongoDB. It allows users to create accounts, write blog posts, and manage their content.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete blog posts
- Markdown support for blog content
- Tag management for blogs
- User dashboard
- Responsive design with neobrutalism aesthetics

## Tech Stack

### Frontend
- React 19
- React Router v6
- Chakra UI for styling
- Axios for API requests
- React Hook Form for form management
- React Markdown for rendering markdown content

### Backend
- FastAPI
- MongoDB with Motor (async driver)
- JWT authentication
- Pydantic for data validation
- CORS support

## Local Development Setup

### Prerequisites
- Node.js (18.x or higher)
- Python (3.9 or higher)
- MongoDB (local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

5. Modify the `.env` file with your MongoDB connection details and secret key.

6. Run the server:
   ```
   python run.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.development` file based on `.env.example`:
   ```
   cp .env.example .env.development
   ```

4. Run the development server:
   ```
   npm run dev
   ```

## Deployment to Vercel

### Backend Deployment

1. Create a MongoDB Atlas account and set up a cluster.

2. Create a new project on Vercel and connect your GitHub repository.

3. Set up the following environment variables in Vercel:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `DATABASE_NAME` - Your MongoDB database name
   - `SECRET_KEY` - A secure random string for JWT
   - `ALLOWED_ORIGINS` - Comma-separated list of allowed origins, including your frontend URL

4. Deploy the backend from the Vercel dashboard or with the Vercel CLI:
   ```
   cd backend
   vercel
   ```

### Frontend Deployment

1. Create a `.env.production` file with your production settings:
   ```
   VITE_API_URL=https://your-backend-vercel-url.vercel.app
   ```

2. Deploy the frontend from the Vercel dashboard or with the Vercel CLI:
   ```
   cd frontend
   vercel
   ```

3. Set the following environment variables in Vercel:
   - `VITE_API_URL` - URL of your deployed backend API

## Usage

1. Register a new account on the signup page
2. Log in with your credentials
3. Create a new blog post using the "Create Blog" button
4. View all blogs on the homepage
5. Manage your blogs in the dashboard
6. Edit or delete your blogs as needed

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Blogs
- GET `/api/blogs` - Get all blogs (with pagination and filtering)
- GET `/api/blogs/{id}` - Get a specific blog
- POST `/api/blogs` - Create a new blog
- PUT `/api/blogs/{id}` - Update a blog
- DELETE `/api/blogs/{id}` - Delete a blog

### Users
- GET `/api/users` - Get all users (with pagination and filtering)
- GET `/api/users/{id}` - Get a specific user

## License

MIT
