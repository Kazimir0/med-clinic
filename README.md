# Medical Web Platform with Integrated Chatbot

A modern web platform for managing medical services in a clinic, offering functionalities for patients, doctors, and administrative staff. Built with modern technologies like Next.js, Prisma, TypeScript, and Clerk for authentication.

## 🩺 Overview

This project is a **full-stack web application** designed to digitize and optimize medical workflows in a clinical environment. The platform streamlines scheduling, patient record management, real-time communication, online payments, and more — tailored to the specific roles of users.

## ✨ Key Features

- 👥 Role-based access for Patients, Doctors, and Admins
- 📅 Appointment booking and real-time calendar
- 📁 Medical history tracking and vital signs visualization
- 💊 Prescription management
- 💳 Online billing and payments with discounts
- 📢 Custom notification system (SMS/email/Push)
- 🤖 Chatbot assistant integration via VoiceFlow
- 📊 Admin dashboard for user and service management

## 🧠 Technologies Used

| Layer        | Tech Stack                                  |
|--------------|---------------------------------------------|
| Frontend     | Next.js, TypeScript, Tailwind CSS           |
| Backend      | Next.js API Routes, Server Actions          |
| Database     | PostgreSQL + Prisma ORM                     |
| Auth         | Clerk                                       |
| Payments     | Stripe                                      |
| UI Library   | shadcn/ui                                   |
| Other libs   | zod, react-hook-form, date-fns, recharts    |
| IDE          | Visual Studio Code                          |
| Dev Platform | Windows                                     |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL (you can use [Neon](https://neon.tech) or Docker)
- Clerk account
- Stripe account

### Installation

```bash
# Clone the repo
git clone https://github.com/Kazimir0/med-clinic.git
cd med-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Then update values in `.env`

# Push Prisma schema to DB
npx prisma db push

# Open Prisma studio
npx prisma studio

# Start the development server
npm run dev

Then open http://localhost:3000 in your browser to view the app.

👨‍🎓 Project Info
This project was developed as part of a Bachelor’s Thesis at:

University: „Dunărea de Jos” din Galați
Faculty: Automatică, Calculatoare, Inginerie Electrică și Electronică
Specialization: CTI
Student: Cătălin Paraschiv
Coordinator: Conf. Dr. ing. Dan Munteanu
Year: 2025