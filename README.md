# TaskFlow - Team Task Manager

TaskFlow is a full-stack team task management app for creating projects, managing members, assigning tasks, tracking status, and reviewing team progress from a dashboard.

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend | Node.js, Express, JWT, Helmet, Compression, Rate Limiting |
| Database | MongoDB Atlas or local MongoDB, Mongoose ODM |
| Deployment | Railway |

## Features

- JWT signup, login, and protected routes
- Project creation with the creator assigned as Admin
- Admin member management by email with Admin or Member roles
- Kanban task board with title, description, due date, priority, assignee, and status
- Role-based access control enforced on the server
- Dashboard with total tasks, tasks by status, tasks per user, overdue tasks, and activity timeline
- Member users can view and update only their assigned tasks
- Railway-ready backend and frontend configuration

## Demo Credentials

Run the seed command after setting `MONGO_URI` to create demo users:

```bash
cd backend
npm run seed
```

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@demo.com | demo1234 |
| Member | member@demo.com | demo1234 |

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB local instance or MongoDB Atlas free M0 cluster

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend environment variables:

```env
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend environment variables:

```env
VITE_API_URL=http://localhost:5000/api
```

## Railway Deployment

### Option A - Single Railway Service From Repo Root

Use this if Railway does not show a root directory setting. The repo root now builds the frontend and starts the Express backend, and Express serves the frontend from `frontend/dist`.

1. Create a new Railway project from this GitHub repository.
2. Do not set a root directory.
3. Add environment variables:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=https://your-railway-app-url.up.railway.app
PORT=5000
```

4. Deploy.
5. After Railway gives the public app URL, update `FRONTEND_URL` to that same URL and redeploy.
6. Open the public URL. The API health check is available at `/api/health`.

### Option B - Separate Backend and Frontend Services

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create taskflow --public --push
```

### 2. Deploy Backend

1. Open Railway and create a new project from the GitHub repository.
2. Set the root directory to `backend`.
3. Add these environment variables:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=https://your-frontend.railway.app
PORT=5000
```

4. Deploy and copy the backend URL.

### 3. Deploy Frontend

1. Add another Railway service from the same GitHub repository.
2. Set the root directory to `frontend`.
3. Add this environment variable:

```env
VITE_API_URL=https://your-backend.railway.app/api
```

4. Deploy. The `serve -s` start command enables SPA route rewrites.

### 4. MongoDB Atlas

1. Create a free Atlas cluster.
2. Create a database user.
3. Allow Railway access by adding `0.0.0.0/0` to Network Access.
4. Use the connection string as `MONGO_URI`.

## API Reference

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Register a user |
| POST | `/api/auth/login` | Public | Login and return JWT |
| GET | `/api/auth/me` | User | Current authenticated user |
| GET | `/api/projects` | User | List projects for current user |
| POST | `/api/projects` | User | Create project as Admin |
| GET | `/api/projects/:id` | Project member | Get project details |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project, tasks, and activities |
| POST | `/api/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/api/projects/:id/activity` | Project member | Last 15 activity events |
| GET | `/api/tasks/project/:projectId` | Project member | List visible tasks |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:id` | Admin or assignee | Get task |
| PUT | `/api/tasks/:id` | Admin or assignee | Admin updates all fields; assignee updates status |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/dashboard/stats?project=:id` | Project member | Dashboard stats |

## Role Permissions

| Action | Admin | Member |
| --- | --- | --- |
| Create, edit, and delete tasks | Yes | No |
| Assign tasks | Yes | No |
| Update task status | Yes | Own assigned tasks only |
| Add and remove members | Yes | No |
| Delete project | Yes | No |
| View dashboard | Yes | Assigned task scope |

## Architecture

```text
React + Vite frontend
  -> Axios JWT requests
  -> Express REST API on Railway
  -> Mongoose models
  -> MongoDB Atlas
```

## Project Structure

```text
taskmanager/
  backend/
    src/
      config/db.js
      controllers/
      middleware/
      models/
      routes/
      scripts/seedDemo.js
    server.js
    railway.toml
  frontend/
    public/_redirects
    src/
      components/
      context/
      pages/
      utils/
    tailwind.config.js
    railway.toml
```

## Screenshots

Add final screenshots after deployment:

- Login or signup page
  <img width="1029" height="851" alt="image" src="https://github.com/user-attachments/assets/0e7b5826-9824-4f02-9cb3-b816f2130786" />

- Projects list
  <img width="1912" height="911" alt="image" src="https://github.com/user-attachments/assets/fe7ff3f1-cec6-4123-a121-c20089f9376d" />

- Kanban board with task filters
  <img width="1908" height="1075" alt="image" src="https://github.com/user-attachments/assets/6ed1d9e5-7065-4a80-8021-72a42dc9b833" />

- Dashboard charts and activity timeline
  <img width="1874" height="1047" alt="image" src="https://github.com/user-attachments/assets/53c6e0e1-456a-4069-8043-c197605e33d8" />

  <img width="1912" height="911" alt="image" src="https://github.com/user-attachments/assets/f9cf7e71-151c-4abc-8589-08cb445283ee" />


## Interview Q&A

- JWT vs sessions: JWT keeps the API stateless and works well with horizontally scaled Railway services.
- RBAC enforcement: every protected backend action checks the authenticated user and project role before returning or mutating data.
- MongoDB relationships: users, projects, tasks, and activities use ObjectId references with Mongoose population where the UI needs display fields.
- Member scope: members only receive assigned tasks and can only update the status of those tasks.
