# CampusFix

**AI-Powered College Complaint Management System**

> Report. Track. Resolve.

CampusFix is a full-stack web application that provides a centralized platform for managing campus complaints. Students can view and upvote issues, volunteers submit complaints that are automatically analyzed by AI, faculty monitor campus health, and administrators manage the entire complaint lifecycle.

![Node.js](https://img.shields.io/badge/Node.js-v20+-green) ![React](https://img.shields.io/badge/React-19-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-8-green) ![Claude AI](https://img.shields.io/badge/AI-Claude-purple)

---

## Features

### Core
- **Complaint Management** — Full CRUD with status tracking (Submitted → In Review → In Progress → Resolved)
- **AI Classification** — Every complaint is automatically categorized, prioritized, and assigned to a department using Claude AI
- **Role-Based Access** — Four distinct roles: Student, Volunteer, Faculty, Admin
- **Image Uploads** — Attach photos to complaints (JPG, PNG, WebP)
- **"I'm Affected" Reporting** — Community voting system to surface widespread campus issues
- **AI Duplicate Detection** — Automatically compares draft complaints against unresolved campus issues to prevent duplicate reports
- **Search & Filter** — Find complaints by keyword, category, priority, department, or status
- **Responsive Design** — Works on desktop, tablet, and mobile

### AI-Powered
- **Auto-Classification** — Claude analyzes complaint text and assigns category, priority, and department
- **Duplicate Detection** — Compares title, description, category, and location against unresolved issues with intelligent fallback
- **Fallback Classification** — Keyword-based fallback when AI is unavailable
- **Campus Insights** — AI-generated briefings summarizing open issues, trends, and recommendations

### Role Capabilities

| Feature | Student | Volunteer | Faculty | Admin |
|---------|---------|-----------|---------|-------|
| View complaints | ✅ | ✅ | ✅ | ✅ |
| Search & filter | ✅ | ✅ | ✅ | ✅ |
| Upvote complaints | ✅ | ✅ | ✅ | ✅ |
| Create complaints | ❌ | ✅ | ❌ | ✅ |
| Upload images | ❌ | ✅ | ❌ | ✅ |
| View AI insights | ❌ | ❌ | ✅ | ✅ |
| Manage volunteers | ❌ | ❌ | ✅ | ✅ |
| Change ticket status | ❌ | ❌ | ❌ | ✅ |
| Edit AI classification | ❌ | ❌ | ❌ | ✅ |
| Delete complaints | ❌ | ❌ | ❌ | ✅ |

---

## Architecture

```
┌──────────────────┐     REST API     ┌──────────────────────────────┐
│   React Frontend │ ◄──────────────► │   Express.js Backend         │
│   (Vite, Tailwind│                  │                              │
│   React Router)  │                  │  ┌─────────┐  ┌───────────┐ │
│   Port: 5173     │                  │  │ MongoDB  │  │ Claude AI │ │
│                  │                  │  │ Mongoose │  │ Anthropic │ │
└──────────────────┘                  │  └─────────┘  └───────────┘ │
                                      │       Port: 3000             │
                                      └──────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS 4, React Router 7, Axios, Lucide React |
| Backend | Node.js 20+, Express.js 4, JWT, bcryptjs, Multer, express-validator |
| Database | MongoDB with Mongoose 8 |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Testing | Jest + Supertest (backend), Playwright (E2E) |

---

## Folder Structure

```
campusfix/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── ticketController.js
│   │   │   ├── upvoteController.js
│   │   │   ├── userController.js
│   │   │   └── insightController.js
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.js          # JWT verification
│   │   │   ├── authorize.js     # Role-based access
│   │   │   ├── upload.js        # Multer config
│   │   │   └── errorHandler.js  # Global error handler
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Ticket.js
│   │   │   └── Upvote.js
│   │   ├── routes/           # Express routes
│   │   │   ├── authRoutes.js
│   │   │   ├── ticketRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── insightRoutes.js
│   │   ├── services/         # Business logic
│   │   │   ├── aiService.js         # Claude integration
│   │   │   ├── fallbackClassifier.js # Keyword-based fallback
│   │   │   └── insightService.js    # Insight aggregation
│   │   ├── utils/
│   │   │   └── seed.js       # Database seeder
│   │   └── server.js         # App entry point
│   ├── uploads/              # Uploaded images
│   ├── tests/                # API tests
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React context (auth)
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v20 or later
- **npm** v10 or later
- **MongoDB** — local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available)
- **Anthropic API Key** — [Get one here](https://console.anthropic.com/) (optional; fallback classification works without it)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/campusfix    # or your Atlas URI
JWT_SECRET=your-secret-key-change-this-in-production
ANTHROPIC_API_KEY=sk-ant-...                       # optional
COLLEGE_EMAIL_DOMAIN=college.edu
FRONTEND_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates sample users and complaints for development.

### 4. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## Test Accounts

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Faculty | faculty@college.edu | faculty123 |
| Volunteer | volunteer@college.edu | volunteer123 |
| Student | student@college.edu | student123 |

---

## API Overview

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new student | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Tickets
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/tickets` | List all tickets | Yes | All |
| POST | `/api/tickets/check-duplicate` | AI duplicate detection against unresolved issues | Yes | All |
| GET | `/api/tickets/:id` | Get ticket details | Yes | All |
| POST | `/api/tickets` | Create ticket | Yes | Volunteer, Admin |
| PATCH | `/api/tickets/:id` | Update ticket | Yes | Admin |
| DELETE | `/api/tickets/:id` | Delete ticket | Yes | Admin |
| POST | `/api/tickets/:id/affected` | Toggle "I'm Affected" status | Yes | All |
| POST | `/api/tickets/:id/upvote` | Toggle upvote (alias) | Yes | All |

### Users
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/users` | List users | Yes | Faculty, Admin |
| PATCH | `/api/users/:id/role` | Change user role | Yes | Faculty, Admin |

### Insights
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/insights` | Get aggregated stats | Yes | Faculty, Admin |
| POST | `/api/insights/generate` | Generate AI briefing | Yes | Faculty, Admin |

---

## Testing

### Backend API Tests
```bash
cd backend
npm test
```

### End-to-End Tests
```bash
cd frontend
npx playwright test
```

---

## Security Considerations

- **Passwords** are hashed with bcrypt (12 rounds)
- **JWT tokens** expire after 7 days
- **Role authorization** is enforced server-side via middleware — not just by hiding UI buttons
- **File uploads** are validated by MIME type and size (5MB max) with randomized filenames
- **API keys** are stored in environment variables, never exposed to the frontend
- **CORS** is configured to allow only the frontend origin
- **Email domain** validation prevents non-college registrations
- **Input validation** on all endpoints using express-validator

---

## Known Limitations

- Image storage is local (not cloud-based) — for production, use S3/GCS
- No real-time updates (WebSockets) — polling or manual refresh for live data
- No email notifications for status changes
- No password reset functionality
- Session management relies on JWT expiry only (no server-side revocation)

---

## Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a process manager (PM2) or containerize with Docker
3. Set up a MongoDB Atlas production cluster
4. Configure CORS for your production frontend URL

### Frontend
```bash
cd frontend
npm run build
```
Serve the `dist/` directory with any static file server (Nginx, Vercel, Netlify).

---

## License

This project is developed as an academic minor project.

---

**CampusFix** — *Report. Track. Resolve.*
