# ⚙️ YourBooks --- Backend API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS
S3](https://img.shields.io/badge/AWS-S3-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Deployment](https://img.shields.io/badge/Deployed-Render-blue?style=for-the-badge)

This repository contains the secure REST API powering the **YourBooks**
cloud-native e-reader platform.

The backend is responsible for:

-   User authentication & authorization (JWT-based)
-   Secure password hashing (bcrypt)
-   PDF & image uploads directly to AWS S3
-   Managing reading progress metadata
-   Handling friend system & social features
-   Serving protected API routes

🌐 **Live Application:** https://yourbooks.space\
💻 **Frontend Repository:**
https://github.com/pratapsur/yourbooks-frontend

------------------------------------------------------------------------

## 🏗 Backend Architecture

### Runtime & Framework

-   Node.js
-   Express.js

### Database

-   MongoDB Atlas
-   Mongoose ODM

### Cloud Storage

-   AWS S3
-   `multer-s3` for direct streaming uploads

### Security

-   JWT (JSON Web Tokens)
-   Bcrypt password hashing
-   CORS configuration
-   Environment-based configuration

### Deployment

-   Hosted on Render

------------------------------------------------------------------------

## 🔐 Environment Variables

To run this server locally, create a `.env` file in the root directory
with:

    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    FRONTEND_URL=http://localhost:5173
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    AWS_REGION=your_aws_region
    AWS_BUCKET_NAME=your_s3_bucket_name

⚠️ Never commit your `.env` file to version control.

------------------------------------------------------------------------

## 🚀 Local Setup

### 1️⃣ Install Dependencies

``` bash
npm install
```

### 2️⃣ Start Development Server

``` bash
npm start
```

The API will run on:

http://localhost:5000

------------------------------------------------------------------------

## 📡 API Responsibilities Overview

-   Authentication routes (`/api/auth`)
-   Book management routes (`/api/books`)
-   Social routes (`/api/social`)
-   Secure middleware-protected endpoints

------------------------------------------------------------------------

## 🧠 Design Philosophy

The backend is designed with a clear separation of concerns:

Frontend (Vercel)\
↓\
Backend API (Render)\
↓\
MongoDB Atlas (Metadata & Users)\
↓\
AWS S3 (File Storage)

This ensures scalability, maintainability, and production-level
deployment readiness.

------------------------------------------------------------------------

## 👨‍💻 Author

**Pratap Suryavanshi**\
Electronics & Computer Engineering Student\
Full-Stack Developer \| Cloud Enthusiast

------------------------------------------------------------------------

⭐ If you found this backend useful, consider giving the repository a
star!
