# Cockpit Management System - Backend API

## Overview
This is the backend API for the Cockpit Management System, built with Node.js, Express.js, and MongoDB. It provides authentication, role-based access control, and staff management functionality.

## Features
- **Authentication & Authorization**: JWT-based authentication with HTTP-only cookies
- **Role-Based Access Control**: Admin, Entrance Staff, Tangkal Staff, Event Staff, Registration Staff
- **Staff Management**: Create, update, enable/disable staff accounts with auto-generated passwords
- **Email Verification**: Automatic email verification for staff accounts
- **Email Notifications**: Account status changes and verification emails

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs
- **CORS**: Cross-origin resource sharing enabled

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cockpit_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration
EMAIL_USER=sabongnation00@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM=sabongnation00@gmail.com
```

### 3. Database Setup
Make sure MongoDB is running and accessible.

### 4. Seed Admin Account
```bash
npm run seed:admin
```

This creates a default admin account:
- **Username**: admin
- **Password**: Password2025@@
- **Email**: sabongnation00@gmail.com

### 5. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Login with username/email and password.

**Request Body:**
```json
{
  "username": "admin",
  "password": "Password2025@@"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": "user_id",
    "username": "admin",
    "email": "sabongnation00@gmail.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "admin",
    "fullName": "System Administrator"
  }
}
```

#### POST `/api/auth/logout`
Logout and clear authentication cookies.

#### POST `/api/auth/register` (Admin only)
Register a new user (admin or staff).

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "event_staff"
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

#### GET `/api/auth/me`
Get current user information.

### Staff Management Endpoints

#### POST `/api/staff` (Admin only)
Create a new staff account with auto-generated password.

**Request Body:**
```json
{
  "email": "staff@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "entrance_staff"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Staff account created successfully. Email sent with account details.",
  "user": {
    "id": "user_id",
    "username": "staff",
    "email": "staff@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "entrance_staff",
    "fullName": "Jane Smith",
    "isActive": true,
    "emailVerified": false
  }
}
```

#### GET `/api/staff` (Admin only)
Get all staff members with pagination and search.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for username, email, or name
- `role`: Filter by role

#### GET `/api/staff/:id` (Admin only)
Get staff member by ID.

#### PATCH `/api/staff/:id/status` (Admin only)
Toggle staff account status (enable/disable).

#### PUT `/api/staff/:id` (Admin only)
Update staff account information.

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "event_staff"
}
```

#### DELETE `/api/staff/:id` (Admin only)
Delete staff account.

### Email Verification Endpoints

#### GET `/api/staff/verify/:token`
Verify email address using verification token.

#### POST `/api/staff/resend-verification`
Resend verification email.

**Request Body:**
```json
{
  "email": "staff@example.com"
}
```

## User Roles

1. **admin**: Full system access, can manage all users and settings
2. **entrance_staff**: Manage entrance fees and tracking
3. **tangkal_staff**: Manage cock profiles and related data
4. **event_staff**: Manage events and schedules
5. **registration_staff**: Handle participant registration

## Security Features

- **HTTP-only Cookies**: JWT tokens stored in secure HTTP-only cookies
- **Password Hashing**: All passwords are hashed using bcrypt
- **Role-based Access**: Endpoints protected by role-based middleware
- **Email Verification**: Staff accounts require email verification
- **Account Status**: Admins can enable/disable staff accounts
- **Login History**: Track user login attempts and devices

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Scripts
- `npm run dev`: Start development server with nodemon
- `npm run seed:admin`: Create default admin account

### File Structure
```
src/
├── config/
│   ├── db.js          # Database connection
│   └── env.js         # Environment variables
├── controllers/
│   ├── auth.controller.js    # Authentication logic
│   └── staff.controller.js   # Staff management logic
├── middleware/
│   └── auth.middleware.js    # Authentication middleware
├── models/
│   └── user.model.js         # User schema
├── routes/
│   ├── auth.routes.js        # Authentication routes
│   └── staff.routes.js       # Staff management routes
├── services/
│   └── email.service.js      # Email functionality
└── seeder/
    └── admin.seeder.js       # Admin account seeder
```

## Email Configuration

The system uses Gmail SMTP for sending emails. To set up:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in the `EMAIL_PASS` environment variable

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong, unique JWT secrets
3. Configure proper CORS origins
4. Use HTTPS for secure cookie transmission
5. Set up proper MongoDB connection (MongoDB Atlas recommended)
6. Configure email service with production SMTP settings

## Support

For issues or questions, please refer to the project documentation or contact the development team.
