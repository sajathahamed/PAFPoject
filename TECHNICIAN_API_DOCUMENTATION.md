# 🔧 Technician API Documentation
## Smart Campus Operations Hub - Technician Module

---

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Status Codes](#status-codes)
7. [Frontend Integration Guide](#frontend-integration-guide)
8. [Backend Architecture](#backend-architecture)

---

## Overview

The Technician Module provides full CRUD (Create, Read, Update, Delete) functionality for managing support tickets in the Smart Campus system. Technicians can:
- View all tickets submitted by students
- Update ticket status (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
- Add comments to tickets
- Manage ticket images (add/delete photos)
- Assign tickets to themselves

---

## Base URL

```
Development: http://localhost:8080/api
Production: https://your-domain.com/api
```

---

## Authentication

All API endpoints require authentication via HTTP-only cookies. The frontend uses `withCredentials: true` to send cookies automatically.

### Headers
```
Content-Type: application/json
```

For image uploads:
```
Content-Type: multipart/form-data
```

---

## API Endpoints

### 1. List All Tickets

**GET** `/api/technician/tickets`

Returns all tickets in the system for technician review.

**Response:**
```json
[
  {
    "id": "65f1a2b3c4d5e6f7890abcde",
    "reporterId": "65f0a1b2c3d4e5f6789abcde",
    "assignedId": null,
    "category": "ELECTRICAL",
    "description": "Projector not working in Room 101",
    "priority": "HIGH",
    "status": "OPEN",
    "images": ["data:image/png;base64,..."],
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

---

### 2. Get Single Ticket

**GET** `/api/technician/tickets/{id}`

Returns details of a specific ticket.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | String | Ticket ID |

**Response:**
```json
{
  "id": "65f1a2b3c4d5e6f7890abcde",
  "reporterId": "65f0a1b2c3d4e5f6789abcde",
  "assignedId": "65f0b1c2d3e4f5678901234",
  "category": "ELECTRICAL",
  "description": "Projector not working in Room 101",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "images": ["data:image/png;base64,..."],
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:45:00"
}
```

---

### 3. Update Ticket Status

**PUT** `/api/technician/tickets/{id}/status`

Updates the status of a ticket. Automatically notifies the reporter.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | String | Ticket ID |

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Valid Status Values:**
- `OPEN` - New ticket, awaiting action
- `IN_PROGRESS` - Technician is working on it
- `RESOLVED` - Issue has been fixed
- `CLOSED` - Ticket is archived

**Response:** Returns the updated ticket object.

---

### 4. Assign Ticket to Self

**PUT** `/api/technician/tickets/{id}/assign`

Assigns the ticket to the current logged-in technician. Also sets status to IN_PROGRESS if currently OPEN.

**Response:** Returns the updated ticket object.

---

### 5. Add Comment

**POST** `/api/technician/tickets/{id}/comments`

Adds a comment to a ticket. Notifies the reporter and other comment participants.

**Request Body:**
```json
{
  "content": "I've inspected the projector. Ordering replacement parts."
}
```

**Response:**
```json
{
  "id": "65f1b2c3d4e5f6789012345",
  "ticketId": "65f1a2b3c4d5e6f7890abcde",
  "userId": "65f0b1c2d3e4f5678901234",
  "content": "I've inspected the projector. Ordering replacement parts.",
  "createdAt": "2024-01-15T14:20:00"
}
```

---

### 6. Get Comments

**GET** `/api/technician/tickets/{id}/comments`

Returns all comments for a ticket, ordered by creation date.

**Response:**
```json
[
  {
    "id": "65f1b2c3d4e5f6789012345",
    "ticketId": "65f1a2b3c4d5e6f7890abcde",
    "userId": "65f0b1c2d3e4f5678901234",
    "content": "I've inspected the projector.",
    "createdAt": "2024-01-15T14:20:00"
  }
]
```

---

### 7. Add Images to Ticket

**POST** `/api/technician/tickets/{id}/images`

Uploads one or more images to a ticket. Uses multipart form data.

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| images | File[] | Image files (PNG, JPG, etc.) |

**Example (JavaScript):**
```javascript
const formData = new FormData();
files.forEach(file => formData.append('images', file));

await axios.post(`/api/technician/tickets/${ticketId}/images`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Response:** Returns the updated ticket with new images in Base64 format.

---

### 8. Delete Image from Ticket

**DELETE** `/api/technician/tickets/{id}/images/{imageIndex}`

Removes an image from a ticket by its index.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | String | Ticket ID |
| imageIndex | Integer | 0-based index of image to delete |

**Response:** Returns the updated ticket object.

---

## Data Models

### Ticket
```typescript
interface Ticket {
  id: string;
  reporterId: string;      // Student who created the ticket
  assignedId?: string;     // Technician assigned to ticket
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  images?: string[];       // Base64 data URLs
  createdAt: string;       // ISO 8601 datetime
  updatedAt: string;       // ISO 8601 datetime
}
```

### TicketCategory
```typescript
enum TicketCategory {
  ELECTRICAL,
  PLUMBING,
  HVAC,
  IT_SUPPORT,
  FURNITURE,
  OTHER
}
```

### TicketPriority
```typescript
enum TicketPriority {
  LOW,
  MEDIUM,
  HIGH
}
```

### TicketStatus
```typescript
enum TicketStatus {
  OPEN,
  IN_PROGRESS,
  RESOLVED,
  CLOSED
}
```

### Comment
```typescript
interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (for comments) |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Ticket doesn't exist |
| 500 | Internal Server Error |

---

## Frontend Integration Guide

### Using the Technician Service

```javascript
import technicianService from './services/technicianService';

// Fetch all tickets
const tickets = await technicianService.getAllTickets();

// Update status
await technicianService.updateTicketStatus(ticketId, 'RESOLVED');

// Add comment
await technicianService.addComment(ticketId, 'Issue resolved.');

// Add images
const files = [file1, file2];
await technicianService.addImages(ticketId, files);

// Delete image
await technicianService.deleteImage(ticketId, 0); // Delete first image
```

### State Management Pattern

```jsx
const [tickets, setTickets] = useState([]);

// After status update
const handleStatusUpdate = async (ticketId, newStatus) => {
  const updated = await technicianService.updateTicketStatus(ticketId, newStatus);
  setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
};
```

---

## Backend Architecture

### Layer Structure

```
Controller → Service → Repository → MongoDB
     ↓           ↓
    DTO      Entity
```

### Key Files

| Layer | File | Purpose |
|-------|------|---------|
| Controller | `TechnicianTicketController.java` | HTTP endpoints |
| Service | `TicketWorkflowService.java` | Business logic |
| Repository | `TicketRepository.java` | MongoDB operations |
| Entity | `Ticket.java` | Data model |
| DTO | `TicketResponse.java` | API response |

### Image Storage

Images are stored as Base64 data URLs directly in MongoDB. This simplifies deployment but has trade-offs:

**Pros:**
- No separate file storage needed
- Atomic with ticket data
- Works with any MongoDB hosting

**Cons:**
- Increases document size
- Limited to ~16MB per ticket (MongoDB limit)

For production with many images, consider using:
- AWS S3
- Cloudinary
- Local file storage with references

---

## Frontend Architecture

### Component Structure

```
pages/
├── TechnicianDashboard.jsx   # Main dashboard with active tickets
└── SolvedTickets.jsx         # Resolved/closed tickets view

services/
└── technicianService.js      # API calls wrapper

components/
└── DashboardSidebar.jsx      # Navigation with Solved Tickets link
```

### Features Implemented

1. **Real-time Data**: Fetches from backend API, not mock data
2. **Status Filtering**: Filter by OPEN, IN_PROGRESS
3. **Status Updates**: Modal to change ticket status
4. **Comments**: Add work notes to tickets
5. **Image Management**: 
   - View attached images
   - Delete images (hover to reveal button)
   - Add new images via file upload
6. **Solved Tickets Page**: Separate view for RESOLVED and CLOSED tickets
7. **Responsive Design**: Works on mobile and desktop

---

## Quick Start

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` calls to `http://localhost:8080` in development.

---

## Testing the API

### Using cURL

```bash
# List tickets
curl -X GET http://localhost:8080/api/technician/tickets \
  -H "Cookie: your-session-cookie"

# Update status
curl -X PUT http://localhost:8080/api/technician/tickets/{id}/status \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"status": "RESOLVED"}'
```

### Using Postman
1. Import the collection (create endpoints as above)
2. Set up cookie authentication or configure session handling
3. Test each endpoint

---

*Last Updated: 2024*
