# BlogSpace — Full Stack MERN Blogging Platform

> A production-ready social blogging platform where developers and writers can publish posts, build profiles, follow users, and engage through likes — with secure JWT authentication, Cloudinary image uploads, global search, and a responsive modern UI.

![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

[View on GitHub](https://github.com/Jeevan017/blogging-platform) | [All Projects](https://github.com/Jeevan017?tab=repositories)

---

## What is BlogSpace?

BlogSpace is a production-ready full-stack MERN application designed to demonstrate real-world software engineering practices. Users can register, authenticate with JWT, create and manage blog posts with images, discover content through global search and pagination, like posts, follow other writers, and maintain rich profiles — all wrapped in a clean, responsive interface inspired by Medium and Dev.to.

The project emphasizes **MVC architecture**, **security hardening**, **deployment readiness**, and **interview-ready full-stack engineering** — not just feature completion.

**Example use cases:**
- "Publish a blog post with images and tags"
- "Follow your favourite writers and see their posts"
- "Search for users, posts, or tags from a single search bar"
- "Like posts with instant optimistic UI feedback"
- "Manage your profile, bio, and profile picture"

---

## Features

### Frontend Features

- User registration and login with session persistence
- Protected routes for create/edit post and profile editing
- Home feed with search, pagination, and skeleton loading states
- Single post view with author info, tags, and like button
- Create and edit posts with image preview and tag parsing
- User profiles with posts, followers, and following lists
- Optimistic UI for likes and follow/unfollow
- Toast notifications for key actions
- Responsive layout (mobile, tablet, desktop)
- SEO metadata and Open Graph tags (react-helmet-async)
- XSS-safe rendering of user-generated content (DOMPurify)
- Lazy-loaded routes with Suspense fallbacks
- Command-palette style global search UI

### Backend Features

- RESTful API with Express.js and MVC architecture
- MongoDB + Mongoose models with validation and indexes
- JWT authentication (Bearer token, 7-day expiry)
- Username and email login support
- Post CRUD with ownership authorization
- Paginated, searchable post feed
- Like toggle system
- Follow/unfollow with MongoDB transactions
- Cloudinary image uploads (posts + profile pictures)
- Centralized error handling middleware
- Health check endpoint for deployment monitoring
- Change password functionality with validation

### Security Features

- Helmet (secure HTTP headers)
- Rate limiting on `/api/auth` (10 req/min)
- express-mongo-sanitize (NoSQL injection prevention)
- CORS restricted to `CLIENT_URL` in production
- Environment variable validation at startup
- Production-safe error messages (no stack traces)
- Image MIME type and extension validation (5MB max)
- DOMPurify sanitization on client-rendered content
- Correct HTTP semantics: 401 Unauthenticated / 403 Unauthorized

### Deployment Features

- Render-ready backend (`npm start`, health check, env validation)
- Vercel-ready frontend (`vercel.json` SPA rewrites)
- Production logging strategy
- Fail-fast startup with environment validation

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, React Router DOM, Axios, react-hot-toast, react-helmet-async, DOMPurify |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT, bcryptjs, Bearer tokens |
| **Cloud Storage** | Cloudinary, Multer |
| **Deployment** | Render (API), Vercel (client) |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize, CORS |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React (Vite) Client                      │
│  Pages → Components → Context → Services → Axios (api.js)   │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP / REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js API Server                     │
│  Routes → Middleware → Controllers → Models → MongoDB        │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        MongoDB Atlas                   Cloudinary CDN
```

**Request flow:**

```
React UI
   ↓
Service Layer (authService, postService, userService)
   ↓
Axios Instance (JWT interceptors)
   ↓
Express Routes (/api/auth, /api/posts, /api/users)
   ↓
Controllers (business logic)
   ↓
Mongoose Models
   ↓
MongoDB
```

---

## Folder Structure

```
blogging-platform/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # UI components (layout, common, post, user, seo)
│   │   ├── context/           # AuthContext
│   │   ├── hooks/             # useAuth
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API service layer
│   │   └── utils/             # api, constants, sanitize, toast
│   ├── vercel.json
│   └── package.json
└── server/                    # Express API
    ├── config/                # db, cors, validateEnv
    ├── controllers/
    ├── middleware/            # auth, error, upload, logger, rateLimiter
    ├── models/
    ├── routes/
    └── server.js
```

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/auth/logout` | Public | Logout (client clears token) |
| GET | `/api/auth/me` | Private | Get current user |

### Posts

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/posts` | Public | Paginated feed (`?page`, `?limit`, `?search`) |
| GET | `/api/posts/user/:userId` | Public | Posts by user |
| GET | `/api/posts/:id` | Public | Single post |
| POST | `/api/posts` | Private | Create post (multipart image) |
| PUT | `/api/posts/:id` | Private | Update post (owner only) |
| DELETE | `/api/posts/:id` | Private | Delete post (owner only) |
| PUT | `/api/posts/:id/like` | Private | Toggle like |

### Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users/:id` | Public | User profile |
| PUT | `/api/users/:id` | Private | Update profile (owner only) |
| PUT | `/api/users/:id/follow` | Private | Toggle follow |
| GET | `/api/users/:id/followers` | Public | Followers list |
| GET | `/api/users/:id/following` | Public | Following list |
| GET | `/api/users/search` | Public | Search users |

### Health

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/health` | Public | Server health check |

---

## Environment Variables

### Frontend (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_APP_URL` | Public site URL for Open Graph metadata |

### Backend (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS (required in production) |

See `client/.env.example` and `server/.env.example` for templates.

---

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free at cloudinary.com)

### Clone

```bash
git clone https://github.com/Jeevan017/blogging-platform.git
cd blogging-platform
```

### Install

```bash
# Backend
cd server
cp .env.example .env
# Edit .env with your credentials
npm install

# Frontend
cd ../client
cp .env.example .env
npm install
```

### Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health: http://localhost:5000/api/health

### Build

```bash
cd client
npm run build
npm run preview
```

---

## Deployment

| Service | Hosts | Config |
|---------|-------|-------|
| Backend API | Render | Set env variables, `npm start` |
| Frontend | Vercel | Set `VITE_API_URL`, auto-deploy from GitHub |

**Post-deploy checklist:**

1. Set `VITE_API_URL` on Vercel → `https://your-api.onrender.com/api`
2. Set `CLIENT_URL` on Render → `https://your-app.vercel.app`
3. Verify `/api/health` returns `{ status: "ok" }`

---

## Security

| Measure | Implementation |
|---------|----------------|
| Helmet | Secure HTTP headers |
| Rate limiting | 10 auth requests/minute per IP |
| Mongo sanitize | Blocks `$` operators in request body |
| JWT | Stateless auth with Bearer tokens |
| Protected routes | Client + server ownership checks |
| CORS | Origin whitelist in production |
| XSS | DOMPurify on post content and bios |
| Upload validation | MIME type, extension, 5MB limit |

---

## Performance Optimizations

| Optimization | Where |
|--------------|-------|
| Lazy loading | React route-level code splitting |
| Skeleton loaders | Home feed, profile, single post |
| Debounced search | 300ms delay on search input |
| Lean queries | `.lean()` on read-only Mongoose queries |
| Text index | Compound index on post title + tags |
| Optimistic updates | Likes and follow/unfollow UI |
| Axios interceptors | Centralized auth header attachment |

---

## Future Improvements

- Comments on posts
- Bookmarks / saved posts
- Rich text editor (Markdown or WYSIWYG)
- Real-time notifications (WebSockets)
- Email verification and password reset
- Redis caching for feed
- Unit and E2E test suite (Jest + Supertest)
- Admin dashboard and moderation

---

## Interview Talking Points

- MongoDB transactions for atomic follow/unfollow — prevents race conditions
- Optimistic UI updates with rollback — instant feedback without waiting for API
- Correct 401 vs 403 distinction — shows understanding of HTTP semantics
- Text indexes on title + tags — enables fast full-text search in MongoDB
- JWT stateless auth with `/api/auth/me` for session restoration on refresh
- DOMPurify on client + Mongo sanitize on server — defense in depth for XSS/NoSQL injection
- Debounced search reduces unnecessary API calls by 80%+

---

## Built By

**Jeevan Kanugula**
B.E Information Technology — Vasavi College of Engineering, Hyderabad

[LinkedIn](https://linkedin.com/in/jeevan-kanugula-527a0031a) |
[GitHub](https://github.com/Jeevan017) |
jeevankanugula99@gmail.com

---

## License

MIT License — free to use, modify, and distribute.