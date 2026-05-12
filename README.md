# Threaded - Outfit Tracker Backend

A RESTful API backend for managing your wardrobe and creating outfit combinations. Built with Node.js, Express, PostgreSQL, and AWS S3.

## Live Demo

- **Live API:** https://threaded-backend-viab.onrender.com
- **Frontend App:** https://threaded-seven.vercel.app
- **Frontend Repo:** *([Frontend Repo](https://github.com/nikvxo/threaded-frontend))*

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Render)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Image Storage:** AWS S3
- **Deployment:** Render

## Features

- User authentication with JWT tokens
- CRUD operations for clothing items and outfits
- Image upload to AWS S3 with unique file naming
- PostgreSQL database with Prisma ORM
- Many-to-many relationship between outfits and clothing items
- RESTful API design with proper error handling
- CORS configured for frontend integration

## API Endpoints

### Authentication
```
POST /api/auth/register - Create new user account
POST /api/auth/login    - Login and receive JWT token
```

### Clothing Items (Protected)
```
GET    /api/clothing     - Get all clothing items
POST   /api/clothing     - Create new clothing item
PUT    /api/clothing/:id - Update clothing item
DELETE /api/clothing/:id - Delete clothing item
```

### Outfits (Protected)
```
GET    /api/outfits     - Get all outfits
GET    /api/outfits/:id - Get specific outfit with items
POST   /api/outfits     - Create new outfit
PUT    /api/outfits/:id - Update outfit
DELETE /api/outfits/:id - Delete outfit
```

### Upload (Protected)
```
POST /api/upload - Upload image to S3 (returns imageUrl)
```

## Database Schema

**User**
- Stores user credentials and authentication info

**ClothingItem**
- Individual clothing pieces with images
- Belongs to a User and Category

**Outfit**
- Collections of clothing items
- Many-to-many relationship with ClothingItems

**Category**
- Organizes clothing items by type

## Local Development

### Prerequisites
- Node.js v18+
- PostgreSQL database
- AWS account with S3 bucket

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nikvxo/threaded-backend.git
   cd threaded-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/threaded?sslmode=require"
   JWT_SECRET="your-secret-key"
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="us-west-1"
   AWS_BUCKET_NAME="your-bucket-name"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   
   Server runs at `http://localhost:3000`

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
threaded-backend/
├── routes/          # API route handlers
├── middleware/      # Authentication middleware
├── lib/             # Prisma client and utilities
├── prisma/          # Database schema and migrations
├── generated/       # Generated Prisma client
└── index.js         # Express app entry point
```

## Deployment

The application is deployed on Render with:
- Automatic deployments from main branch
- PostgreSQL database on Render
- AWS S3 for image storage
- Environment variables configured

## Key Learning Outcomes

- Built a full-stack application with separate frontend/backend
- Implemented JWT authentication from scratch
- Integrated AWS S3 for cloud file storage
- Used Prisma ORM with PostgreSQL
- Deployed to cloud platforms (Render)
- Configured CORS for cross-origin requests
- Managed environment variables across deployments

## Future Enhancements

- Category filtering and search
- Unit and integration tests
- Rate limiting and security headers
- Outfit recommendations based on weather
- Image optimization and caching

