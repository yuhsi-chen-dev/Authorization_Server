# OAuth 2.0 Authorization Server

A minimal viable OAuth 2.0 Authorization Server implementation with PKCE support, built with Node.js and Express.

## Overview

This project implements a custom OAuth 2.0 Authorization Server that supports:
- Authorization Code Flow with PKCE
- JWT-based access tokens and ID tokens (OIDC)
- User authentication with bcrypt
- Consent screen for authorization
- SQLite database for storage

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **better-sqlite3** - Database
- **jsonwebtoken** - JWT token generation
- **bcrypt** - Password hashing
- **Bootstrap** - UI styling

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```
PORT=3000
JWT_SECRET=your-secret-key-here
DB_PATH="./auth.sqlite"
```

### 3. Initialize Database

```bash
npm run db:init   # Create tables
npm run db:seed   # Insert test data
```

### 4. Start Server

```bash
npm start         # Production
npm run dev       # Development (with auto-reload)
```

Server will run on `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/authorize` | GET | Display login page |
| `/login` | POST | Authenticate user |
| `/consent` | POST | Handle authorization consent |
| `/oauth/token` | POST | Exchange code for tokens |
| `/v2/logout` | GET | Logout and redirect |

## Test Credentials

**Test User Account:**
- Email: `verna.chen@masterconcept.ai`
- Password: `123456789`

**OAuth Client(2nd_project):**
- Client ID: `6oYjcdxWWdRACTxSVxge9VK1G1UMvKuX`
- Redirect URI: `http://localhost:5173`

## Database Schema

### users
- `id`, `email`, `password_hash`, `name`, `created_at`

### clients
- `client_id`, `client_name`, `redirect_uri`, `created_at`

### authorization_codes
- `code`, `user_id`, `client_id`, `redirect_uri`, `code_challenge`, `scope`, `expires_at`, `used`
