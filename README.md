# AI Political Poster Maker 🎨

An end-to-end full-stack application for automated, high-resolution political campaign poster generation. Users can authenticate, select customizable themes, upload candidate photos to Cloudinary, and render customized political posters in real time.

---

## 🚀 Key Features

* **User Authentication:** Secure JWT-based registration and login with encrypted passwords (`bcryptjs`).
* **Multi-Template Selector:** Dynamic templates for Election Campaigns, Solemn Tributes, and Victory Day celebrations with customizable themes, color palettes, and typographic styling.
* **Cloudinary Photo Upload:** Direct in-memory photo uploads (supports 1–3 candidate images up to 5MB each).
* **Automated High-DPI Poster Rendering:** Headless browser composite rendering of candidate photos, party details, election slogans, and regional information into high-resolution 3:4 print-ready posters.
* **Poster History & Export:** Real-time generated preview, direct high-resolution image downloads, and instant retrieval of user poster history from MongoDB.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4
* **State Management:** React Hooks (`useState`, `useEffect`)

### Backend
* **Runtime:** Node.js (ES Modules) with TypeScript
* **Framework:** Express 5
* **Database:** MongoDB with Mongoose ODM
* **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
* **Media Management:** Cloudinary SDK & Multer (Memory Storage)
* **Rendering Engine:** Puppeteer (Headless Browser Composite Graphics)

---

## 📁 Repository Structure

```text
AI-Political-Poster-Maker/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary configurations
│   │   ├── middleware/      # JWT authentication middleware
│   │   ├── models/          # User, Template, and Poster Mongoose schemas
│   │   ├── routes/          # Auth, Upload, Templates, and Posters API routes
│   │   ├── seed/            # Default poster templates seeder
│   │   ├── services/        # Puppeteer composite poster rendering service
│   │   └── server.ts        # Express server entrypoint
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── globals.css      # Tailwind design system
│   │   ├── layout.tsx       # Root metadata and layout
│   │   └── page.tsx         # Full-featured poster generator UI
│   ├── .env.example
│   ├── .gitignore
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore               # Root git ignore rules
└── README.md
```

---

## ⚙️ Environment Variables Setup

### Backend Configuration (`backend/.env`)

Create a `.env` file in the `backend/` directory using the provided template:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Configuration (`frontend/.env.local`)

Create a `.env.local` file in the `frontend/` directory (optional in development, defaults to `http://localhost:5000`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📦 Installation & Getting Started

### 1. Prerequisites
* Node.js (v18+ recommended)
* MongoDB database instance (Local or MongoDB Atlas)
* Cloudinary account (Free tier)

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed the default templates into MongoDB
npm run dev
# (or execute template seeder directly: npx tsx src/seed/templates.ts)

# Start backend server in development mode
npm run dev
```

The backend server will run on `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 📡 API Overview

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Authenticate user & receive JWT token |
| `GET` | `/api/templates` | No | Retrieve active poster templates |
| `POST` | `/api/upload` | Yes (Bearer) | Upload 1–3 candidate images to Cloudinary |
| `POST` | `/api/posters` | Yes (Bearer) | Create poster & trigger headless composite render |
| `POST` | `/api/posters/:id/render` | Yes (Bearer) | Re-render an existing poster draft |
| `GET` | `/api/posters` | Yes (Bearer) | Fetch all posters for the authenticated user |
| `GET` | `/api/health` | No | Health check endpoint |

---

## 🔒 Security Best Practices

* **No Credentials in Git:** `.env` files and local secrets are excluded in `.gitignore`.
* **Password Hashing:** Passwords are salted and hashed using `bcryptjs` with 10 rounds.
* **Route Protection:** All creation, upload, and poster retrieval endpoints are protected with standard `Bearer <token>` verification.
