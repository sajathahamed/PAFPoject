# Smart Campus Operations Hub - Module E

## Authentication & Authorization Module

A comprehensive authentication system for the Smart Campus Operations Hub university web platform, featuring OAuth2 Google Sign-In, JWT tokens, and role-based access control.

### Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.2.3
- Spring Security 6.x with OAuth2
- JWT (JJWT 0.12.5)
- MySQL Database
- Maven

**Frontend:**
- React 18
- React Router v6
- Axios
- Vite

---

## Features

### Authentication
- Google OAuth2 Sign-In
- JWT access tokens (15 min expiry)
- Refresh tokens (7 days expiry, stored in DB)
- HttpOnly cookie storage (XSS protection)
- Automatic token refresh on 401

### Authorization
- Role-based access control (USER, ADMIN, TECHNICIAN)
- Protected routes with role requirements
- Method-level security (@PreAuthorize)
- Admin-only user management

### API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/auth/me` | Get current user profile | Authenticated |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| DELETE | `/api/auth/logout` | Logout and revoke tokens | Public |
| GET | `/api/users` | List all users | ADMIN |
| PUT | `/api/users/{id}/role` | Update user role | ADMIN |

---

## Quick Start

### Prerequisites
- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Google OAuth2 credentials

### Backend Setup

1. **Create MySQL database:**
```sql
CREATE DATABASE smart_campus_db;
```

2. **Configure environment variables:**
```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
export JWT_SECRET=your-256-bit-secret-key
export MYSQL_PASSWORD=your-mysql-password
```

3. **Run the backend:**
```bash
cd backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## Project Structure

```
PAFProject/
├── backend/
│   ├── src/main/java/com/smartcampus/auth/
│   │   ├── controller/        # REST endpoints
│   │   ├── dto/               # Data transfer objects
│   │   ├── entity/            # JPA entities
│   │   ├── exception/         # Exception handlers
│   │   ├── repository/        # Data repositories
│   │   ├── security/          # Security components
│   │   └── service/           # Business logic
│   └── src/test/java/         # Unit & integration tests
│
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios instance
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   └── services/          # API service functions
│   └── vite.config.js
│
└── .github/workflows/         # CI/CD configuration
```

---

## Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│    Google    │
│  Login Page  │     │  OAuth2 URL  │     │   OAuth2     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                     ┌──────────────┐             │
                     │   Backend    │◀────────────┘
                     │ OAuth2 Handler│  (authorization code)
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Create/Update│
                     │    User      │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Generate JWT │
                     │ Set Cookies  │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Redirect to │
                     │   Frontend   │
                     └──────────────┘
```

---

## Testing

### Run Backend Tests
```bash
cd backend
mvn test                    # Unit tests only
mvn verify                  # Unit + integration tests
```

### Run Frontend Lint
```bash
cd frontend
npm run lint
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Required |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | Required |
| `JWT_SECRET` | Secret key for JWT signing (256+ bits) | Required |
| `MYSQL_PASSWORD` | MySQL database password | Empty |

---

## Security Considerations

1. **JWT Storage**: Tokens stored in HttpOnly cookies (not localStorage)
2. **Token Rotation**: Refresh tokens are rotated on use
3. **CORS**: Configured for specific origins only
4. **CSRF**: Disabled (stateless JWT auth)
5. **Role Validation**: Server-side check on every request

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| HttpOnly Cookies | XSS protection; tokens inaccessible to JavaScript |
| Token Rotation | Limits damage from token theft |
| UUID Refresh Tokens | Enables server-side revocation |
| Backend OAuth2 | Spring Security handles complexity; frontend just redirects |
| Vite over CRA | Faster builds, modern ESM tooling |

---

## License

This project is developed for SLIIT IT3030 PAF Assignment.
