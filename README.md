# SmartCampus — Authentication + Technician Module

Stack: React 18 (Vite) · Spring Boot 3.2 · MongoDB · Google OAuth2 · JWT

---

## Project structure

```
PAFPoject/
├── backend/          ← Spring Boot API
└── frontend/         ← React + Vite SPA
```

---

## 1. Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.9+ |
| Node.js | 18+ |
| MongoDB | 6+ (running locally on port 27017) |

---

## 2. Google Cloud setup (required)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `http://localhost:5173` to **Authorised JavaScript origins**
4. Copy the **Client ID**

---

## 3. Configure environment variables

### Backend — `backend/src/main/resources/application.properties`

```properties
google.client.id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
jwt.secret=some-long-random-secret-at-least-32-chars
technician.test.email=the-email-you-will-log-in-with@gmail.com
```

> `technician.test.email` — any **new** user whose email matches this string is automatically
> assigned the `TECHNICIAN` role. Use your own Google account email here to test the dashboard.

### Frontend — `frontend/.env`

```
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
VITE_API_URL=http://localhost:8080
```

---

## 4. Run the backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

On first start, `DataSeeder` will automatically populate MongoDB with 4 users and 6 tickets.

---

## 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

---

## 6. Testing the application

### Getting the TECHNICIAN role

Set `technician.test.email` in `application.properties` to the Gmail address you will sign in
with. On first login via Google (or via the sign-up form), that account is assigned
`TECHNICIAN` and redirected to `/technician/dashboard`.

> **Note:** The role is assigned only when the user does not already exist in the database.
> If you change `technician.test.email` after a run, **drop the `users` collection** in MongoDB
> first (`db.users.drop()`), or just delete only that specific user document.

### Login options

| Method | How |
|--------|-----|
| Google OAuth | Click **Sign in with Google** — uses the Google popup |
| Email + password | Use the **Sign In / Create Account** form below the Google button |

---

## 7. Seeded data

The seeder creates **4 users** (one per role) and **6 tickets assigned to the TECHNICIAN**:

### Seeded tickets

| # | Title | Status |
|---|-------|--------|
| 1 | WiFi Connectivity Issue in Block A | IN_PROGRESS |
| 2 | Projector Not Working in Room B204 | IN_PROGRESS |
| 3 | Lab Computer #14 Fails to Boot | IN_PROGRESS |
| 4 | Printer Jam in Faculty Office | RESOLVED |
| 5 | Software License Expired — MATLAB | RESOLVED |
| 6 | Air Conditioning Unit Malfunction — Server Room | RESOLVED |

The seeded **technician user** (Kasun Rajapaksa, `kasun.rajapaksa@sliit.lk`) is a MongoDB-only
seed account. To log in as a technician yourself, use your own Google account or email/password
and set `technician.test.email` accordingly.

---

## 8. API endpoints summary

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/google/callback` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/signup` | Public |
| GET  | `/api/users/me` | JWT required |
| GET  | `/api/resources?type=&capacity=&location=&status=&q=` | JWT required |
| GET  | `/api/resources/:id` | JWT required |
| POST | `/api/resources` | JWT + ADMIN role |
| PUT  | `/api/resources/:id` | JWT + ADMIN role |
| PATCH | `/api/resources/:id/status` | JWT + ADMIN role |
| DELETE | `/api/resources/:id` | JWT + ADMIN role |
| GET  | `/api/technician/tickets?status=ALL` | JWT + TECHNICIAN role |
| PUT  | `/api/technician/tickets/:id/status` | JWT + TECHNICIAN role |
| GET  | `/actuator/health` | Public |

---

## 9. Role redirect map

| Role | Redirect after login |
|------|---------------------|
| STUDENT | `/student/home` |
| LECTURER | `/lecturer/home` |
| TECHNICIAN | `/technician/dashboard` |
| ADMIN | `/admin/resources` |

---

## 10. Resource Catalogue (Module A)

### Frontend routes

| Route | Who | Description |
|------|-----|-------------|
| `/resources` | Any logged-in user | Browse/search/filter resources |
| `/resources/:id` | Any logged-in user | View resource details |
| `/admin/resources` | ADMIN | Manage resources (CRUD + status toggle) |

### Filtering query parameters

- `type`: `ROOM` \| `LAB` \| `HALL`
- `capacity`: integer (min capacity, must be > 0)
- `location`: string (case-insensitive contains match)
- `status`: `ACTIVE` \| `OUT_OF_SERVICE`
- `q`: string (case-insensitive contains match on `name`)

Example:

`GET /api/resources?type=LAB&capacity=25&location=Malabe&status=ACTIVE&q=computer`

### Sample API responses

#### GET `/api/resources`

```json
[
  {
    "id": "6613f4c4b4c9a34b2f8c2f11",
    "name": "Main Auditorium",
    "type": "HALL",
    "capacity": 250,
    "location": "Malabe - Block A",
    "status": "ACTIVE",
    "createdAt": "2026-04-08T10:12:30.120",
    "updatedAt": "2026-04-08T10:12:30.120"
  }
]
```

#### POST `/api/resources` (ADMIN)

Request:

```json
{
  "name": "Lab 3",
  "type": "LAB",
  "capacity": 40,
  "location": "Malabe - Faculty of Computing"
}
```

Response (201):

```json
{
  "id": "6613f4c4b4c9a34b2f8c2f12",
  "name": "Lab 3",
  "type": "LAB",
  "capacity": 40,
  "location": "Malabe - Faculty of Computing",
  "status": "ACTIVE",
  "createdAt": "2026-04-08T10:12:30.120",
  "updatedAt": "2026-04-08T10:12:30.120"
}
```

#### PATCH `/api/resources/:id/status` (ADMIN)

Request:

```json
{ "status": "OUT_OF_SERVICE" }
```

Validation error example (400):

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fields": { "capacity": "must be greater than or equal to 1" }
}
```
