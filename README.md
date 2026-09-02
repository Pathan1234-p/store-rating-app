# Store Rating Platform

A full-stack web application where users can submit ratings (1–5) for registered stores. Supports three roles: System Administrator, Normal User, and Store Owner.

## Tech Stack

- **Backend:** Express.js, Sequelize ORM, PostgreSQL, JWT auth, bcryptjs, express-validator
- **Frontend:** React (Vite, JavaScript), React Router, Axios

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Create the database

```sql
CREATE DATABASE store_rating_db;
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
npm install
npm run seed    # Creates the first admin account
npm run dev     # Starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:5173 (proxies /api to backend)
```

## Default Admin Account

After running `npm run seed`, log in with:

| Field    | Value              |
|----------|--------------------|
| Email    | admin@store.com    |
| Password | Admin@123          |

Override these in `backend/.env` via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.

## Validation Rules

| Field    | Rule                                                                 |
|----------|----------------------------------------------------------------------|
| Name     | 20–60 characters                                                     |
| Address  | Max 400 characters                                                   |
| Password | 8–16 characters, at least one uppercase letter and one special char  |
| Email    | Standard email format                                                |
| Rating   | Integer 1–5                                                          |

## API Endpoints

### Auth (`/api/auth`)

| Method | Path       | Access        | Description              |
|--------|------------|---------------|--------------------------|
| POST   | /login     | Public        | Login (all roles)        |
| POST   | /signup    | Public        | Register (normal users)  |
| PUT    | /password  | Authenticated | Change password          |
| GET    | /me        | Authenticated | Current user info        |

### Admin (`/api/admin`) — admin role only

| Method | Path          | Description                                 |
|--------|---------------|---------------------------------------------|
| GET    | /dashboard    | Stats: users, stores, ratings count         |
| POST   | /users        | Create user (any role)                      |
| POST   | /stores       | Create store                                |
| GET    | /users        | List users (filter + sort)                  |
| GET    | /stores       | List stores with avg rating (filter + sort) |
| GET    | /users/:id    | User details (+ store rating if owner)      |

### Stores (`/api/stores`) — normal user role only

| Method | Path                  | Description                       |
|--------|-----------------------|-----------------------------------|
| GET    | /                     | List stores with search + ratings |
| POST   | /:storeId/ratings     | Submit a rating                   |
| PUT    | /:storeId/ratings     | Update existing rating            |

### Owner (`/api/owner`) — store owner role only

| Method | Path        | Description                        |
|--------|-------------|------------------------------------|
| GET    | /dashboard  | Raters list + average store rating |

## Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/         User, Store, Rating + associations
│   │   ├── middleware/     auth.js, validators.js
│   │   ├── controllers/    auth, admin, store, owner
│   │   ├── routes/
│   │   ├── utils/seed.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/     Navbar, ProtectedRoute, SortableTable
    │   ├── pages/          Login, Signup, admin/, normal/, owner/
    │   └── App.jsx
    ├── vite.config.js
    └── package.json
```

## Roles & Features

### System Administrator
- Dashboard with total users, stores, and ratings
- Create users (admin, normal, owner) and stores
- List/filter/sort users and stores
- View user details (includes store rating for owners)

### Normal User
- Public signup and login
- Browse and search stores
- Submit and modify ratings (1–5) per store
- Change password

### Store Owner
- Login (created by admin)
- Dashboard showing who rated their store and average rating
- Change password
