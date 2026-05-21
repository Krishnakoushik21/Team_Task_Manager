# TaskFlow — Team Task Manager

TaskFlow is a full-stack team collaboration and task management application built for managing projects, assigning tasks, and tracking team progress.

The app supports role-based access control where Admins can manage projects and members, while Members can update and track their assigned tasks.

## Live Demo

Frontend: https://daring-sparkle-production-1ea0.up.railway.app

Backend API: https://teamtaskmanager-production-d78f.up.railway.app

---

# Features

- User authentication using JWT
- Create and manage projects
- Add or remove team members
- Create, assign, and track tasks
- Task priorities and due dates
- Kanban-style workflow
- Dashboard analytics
- Role-based permissions (Admin / Member)
- Overdue task tracking

---

# Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Deployment
- Railway
- MongoDB Atlas

---

# Demo Accounts


## Member
Email:
```txt
zoro.roranoa@gmail.com
```

Password:
```txt
Krishna@2026
```

---

# Screenshots

## Login Page

<img width="1029" height="851" alt="image" src="https://github.com/user-attachments/assets/0e7b5826-9824-4f02-9cb3-b816f2130786" />

---

## Projects Dashboard

<img width="1912" height="911" alt="image" src="https://github.com/user-attachments/assets/fe7ff3f1-cec6-4123-a121-c20089f9376d" />

---

## Task Board

<img width="1908" height="1075" alt="image" src="https://github.com/user-attachments/assets/6ed1d9e5-7065-4a80-8021-72a42dc9b833" />

---

## Analytics Dashboard

<img width="1874" height="1047" alt="image" src="https://github.com/user-attachments/assets/53c6e0e1-456a-4069-8043-c197605e33d8" />

<img width="1912" height="911" alt="image" src="https://github.com/user-attachments/assets/f9cf7e71-151c-4abc-8589-08cb445283ee" />

---

# Local Setup

## Clone Repository

```bash
git clone https://github.com/Krishnakoushik21/Team_Task_Manager.git
cd Team_Task_Manager
```

---

# Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env`

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
PORT=5000
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

# API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/projects` | Get user projects |
| POST | `/api/projects` | Create project |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| GET | `/api/dashboard/stats` | Dashboard analytics |

---

# Role Permissions

| Action | Admin | Member |
|---|---|---|
| Create Project | ✅ | ❌ |
| Add Members | ✅ | ❌ |
| Create Tasks | ✅ | ❌ |
| Assign Tasks | ✅ | ❌ |
| Update Assigned Tasks | ✅ | ✅ |
| Delete Project | ✅ | ❌ |

---

# Project Structure

```txt
backend/
frontend/
```

---

# Future Improvements

- Real-time updates with Socket.IO
- File attachments
- Activity logs
- Team chat
- Email notifications
- Dark mode

---

# Author

Krishna Koushik
