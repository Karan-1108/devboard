# DevBoard - Full-Stack Job Application Tracker

DevBoard is a full-stack web application designed to help job seekers efficiently track their job applications. It provides a centralized dashboard to manage applications, track statuses, and view application statistics.

## 🚀 Live Demo
* **Frontend:** [https://devboard-yourname.vercel.app](https://devboard-yourname.vercel.app) *(Replace with your actual link)*
* **Backend API:** [https://devboard-backend.onrender.com](https://devboard-backend.onrender.com) *(Replace with your actual link)*

## ✨ Features
* **User Authentication:** Secure signup and login using JWT (JSON Web Tokens) and bcrypt password hashing.
* **Protected Routes:** Middleware ensures users can only access their own data.
* **CRUD Operations:** Add, view, edit, and delete job applications.
* **Status Filtering:** Easily filter applications by status (Applied, Interview, Offer, Rejected).
* **Stats Dashboard:** Real-time metrics showing total applications and response rates.
* **Responsive UI:** Built with Tailwind CSS for a seamless experience across devices.

## 🛠️ Tech Stack
* **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
* **Backend:** Node.js, Express.js, TypeScript
* **Database:** PostgreSQL (hosted on Neon/Supabase)
* **ORM:** Prisma
* **Authentication:** JWT, bcrypt
* **Deployment:** Vercel (Frontend), Render (Backend)

## ⚙️ Local Setup
1. Clone the repository
   `git clone https://github.com/Karan-1108/devboard.git`
2. Install dependencies (both frontend and backend)
   `npm install`
3. Set up `.env` file with your `DATABASE_URL`, `JWT_SECRET`, and `PORT`.
4. Run Prisma migrations
   `npx prisma migrate dev`
5. Start the development server
   `npm run dev`

## 📸 Screenshots
*(Add 1-2 screenshots of your dashboard and login page here)*
