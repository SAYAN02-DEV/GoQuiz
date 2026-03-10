# GoQuiz

> An AI-powered live quiz platform for educators and students — real-time leaderboards, multiple question types, and instant results.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Redis Data Model](#redis-data-model)
- [Live Quiz Flow](#live-quiz-flow)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Running in Production](#running-in-production)

---

## Overview

GoQuiz is a full-stack web application that lets educators create classes, build quizzes (live or past), and track student performance through a real-time leaderboard. Students join classes with a secret key, take quizzes, and see live rankings update the moment any participant submits an answer — just like competitive coding platforms.

There are two user roles:

| Role | Capabilities |
|------|-------------|
| **Educator** | Create classes · Invite students · Create quizzes · Add questions · Start / end live quizzes · View results |
| **Student** | Join classes · Take live & past quizzes · View personal results · See live leaderboard |

---

## Features

- **Live Quizzes** — real-time room-based leaderboard that updates for every participant the moment an answer is submitted
- **Past Quizzes** — static quizzes with a due date; students submit all at once when ready
- **Three Question Types**
  - SCQ (Single Correct) — one option; auto-submits on click
  - MCQ (Multiple Correct) — multiple options; confirm button
  - Integer — free-form number input; confirm button
- **Negative Marking** — configurable correct/negative points per question
- **Live Leaderboard** — top 10 ranked list with 🥇🥈🥉 medals, progress bars, "you" highlight, and your own row pinned if outside top 10
- **Post-quiz Result** — detailed breakdown of every answer with points earned/lost
- **Past Leaderboard** — final ranked results after quiz closes
- **JWT Authentication** — separate sessions for educators and students, signed with HMAC-SHA256
- **Redis Caching** — quiz metadata cached in Redis so every answer submission hits memory, not the database

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend & API | [Next.js 16](https://nextjs.org/) (App Router) — React 19, TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Database | PostgreSQL |
| ORM | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| Cache / Queue | [Redis](https://redis.io/) via [ioredis](https://github.com/redis/ioredis) |
| WebSocket Server | [Socket.io 4](https://socket.io/) on Express (Node.js) |
| Auth | JWT — custom HMAC-SHA256 implementation using Web Crypto API |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│   Next.js pages · React components · socket.io-client          │
└────────────┬────────────────────────────────┬───────────────────┘
             │ HTTP (REST)                     │ WebSocket
             ▼                                 ▼
┌────────────────────────┐       ┌─────────────────────────────┐
│  Next.js App (port 3000)│       │  WebSocket Server (port 8002)│
│  API Routes /api/v1/   │       │  Express + Socket.io         │
│  Server Components     │       │  BLPOP Queue Worker          │
│  JWT Auth (cookies)    │       │  Redis pub/sub (quiz_ended)  │
└──────────┬─────────────┘       └──────────────┬──────────────┘
           │                                     │
           ▼                                     ▼
┌──────────────────────┐         ┌───────────────────────────────┐
│     PostgreSQL        │         │            Redis               │
│  persistent data      │         │  quiz meta · leaderboard      │
│  users, quizzes,      │         │  answer queue · pub/sub       │
│  attempts, answers    │         │  student names · points       │
└──────────────────────┘         └───────────────────────────────┘
```

### How a live quiz answer flows

```
Student clicks option
        │
        ▼
POST /api/v1/submitliveanswer  (Next.js API Route)
  ├─ validate session
  ├─ load quiz meta from Redis (fast cache lookup)
  ├─ check idempotency (Redis HEXISTS — no double-submit)
  ├─ evaluate answer → points_earned
  ├─ PIPELINE: hset answer · incrby points · (atomic)
  └─ RPUSH { quiz_id, student_id, points_earned } → answer queue

        │  (Redis list, FIFO)
        ▼
WebSocket Server — BLPOP worker (always running)
  ├─ ZINCRBY leaderboard sorted set
  ├─ ZREVRANGE + HMGET → ranked snapshot
  └─ io.to("quiz:123").emit("leaderboard_update", snapshot)

        │  (Socket.io room broadcast)
        ▼
All students in room "quiz:123"
  └─ React state update → leaderboard re-renders instantly
```

---

## Project Structure

```
GoQuiz/
├── server/                     # Next.js application
│   ├── app/
│   │   ├── api/v1/             # REST API routes
│   │   │   ├── login/          # Student login
│   │   │   ├── me/             # Current session info
│   │   │   ├── logout/         # Clear session cookie
│   │   │   ├── joinclass/      # Student joins a class with secret key
│   │   │   ├── myclasses/      # List enrolled classes
│   │   │   ├── quizzes/        # List quizzes for a class
│   │   │   ├── takelivequiz/   # Load live quiz + register student in Redis
│   │   │   ├── submitliveanswer/  # Submit answer → queue → leaderboard
│   │   │   ├── takepastquiz/   # Load past quiz questions
│   │   │   ├── pasttestsubmit/ # Submit all past quiz answers at once
│   │   │   ├── submitanswer/   # Submit single answer (past quiz)
│   │   │   ├── myresult/       # Student's quiz attempt results
│   │   │   ├── liveresult/     # Points from Redis + attempt_id after quiz ends
│   │   │   ├── leaderboard/
│   │   │   │   ├── live/       # Current Redis leaderboard snapshot
│   │   │   │   └── past/       # DB leaderboard for completed quizzes
│   │   │   └── educater/       # Educator-only routes
│   │   │       ├── login/
│   │   │       ├── myclasses/
│   │   │       ├── newclass/
│   │   │       ├── newquiz/
│   │   │       ├── questions/  # Add questions to a quiz
│   │   │       └── endlivequiz/  # End quiz → persist attempts → pub quiz_ended
│   │   ├── components/         # Shared UI (Header, Footer)
│   │   ├── lib/
│   │   │   ├── auth.ts         # JWT sign/verify helpers
│   │   │   └── redis.ts        # Redis singleton + key helpers + types
│   │   ├── home/               # Student home page
│   │   ├── login/              # Login pages
│   │   ├── select-role/        # Role selection screen
│   │   ├── dashboard/          # Educator dashboard
│   │   ├── educater/           # Educator pages (classes, quiz builder)
│   │   ├── profile/            # Student profile
│   │   ├── LiveQuiz/[quizid]/  # Live quiz-taking page
│   │   ├── LiveQuizComplete/[quizid]/  # Post-quiz waiting room
│   │   ├── PastQuiz/[quizid]/  # Past quiz-taking page
│   │   ├── QuizResult/         # Detailed results page
│   │   └── Leaderboard/[quizid]/  # Leaderboard page
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── .env                    # Environment variables (see below)
│
├── websocket/                  # Standalone WebSocket server
│   ├── index.js                # Express + Socket.io + Redis worker
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## Database Schema

```
Educator ──< Class ──< Quiz ──< Question ──< Option
                  │                │
                  └──< Class_Admission ──> Student
                                   │
                                   └──< Quiz_Attempt ──< Student_Answer
                                                                │
                                                                └──< Student_Answer_Option (MCQ)
```

### Key models

| Model | Description |
|-------|-------------|
| `Educator` | Platform teacher — creates classes and quizzes |
| `Class` | A class with a `secret_key` students use to enrol |
| `Student` | Platform learner — joins classes and takes quizzes |
| `Class_Admission` | Many-to-many join: student ↔ class |
| `Quiz` | A quiz belonging to a class; `is_live` flag distinguishes type |
| `Question` | Belongs to a quiz; `question_type` 1=SCQ, 2=MCQ, 3=Integer |
| `Option` | Answer choices for SCQ/MCQ questions |
| `Quiz_Attempt` | One attempt per student per quiz; stores total `points` |
| `Student_Answer` | One row per question in an attempt |
| `Student_Answer_Option` | MCQ selected options (many-to-many) |

---

## API Reference

All routes are under `/api/v1/`. Authentication is via `HttpOnly` session cookies.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/login` | — | Student login (email/phone) |
| `POST` | `/api/v1/educater/login` | — | Educator login |
| `POST` | `/api/v1/logout` | Student | Clear session cookie |
| `GET` | `/api/v1/me` | Student | Current student session info |

### Student — Classes & Quizzes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/joinclass` | Student | Join a class with `secret_key` |
| `GET` | `/api/v1/myclasses` | Student | List enrolled classes |
| `GET` | `/api/v1/quizzes?class_id=` | Student | List quizzes in a class |

### Student — Live Quiz

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/takelivequiz?quiz_id=` | Student | Load quiz + register in Redis |
| `POST` | `/api/v1/submitliveanswer` | Student | Submit answer → queue → leaderboard update |
| `GET` | `/api/v1/liveresult?quiz_id=` | Student | Points from Redis, attempt_id if quiz ended |
| `GET` | `/api/v1/leaderboard/live?quiz_id=` | Student | Current Redis leaderboard snapshot |

### Student — Past Quiz

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/takepastquiz?quiz_id=` | Student | Load past quiz questions |
| `POST` | `/api/v1/pasttestsubmit` | Student | Submit all answers at once |

### Student — Results

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/myresult?attempt_id=` | Student | Detailed attempt result |
| `GET` | `/api/v1/leaderboard/past?quiz_id=` | Student | Final leaderboard from DB |

### Educator

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/educater/myclasses` | Educator | List created classes |
| `POST` | `/api/v1/educater/newclass` | Educator | Create a class |
| `POST` | `/api/v1/educater/newquiz` | Educator | Create a quiz |
| `POST` | `/api/v1/educater/questions` | Educator | Add questions to a quiz |
| `POST` | `/api/v1/educater/endlivequiz` | Educator | End live quiz → persist all attempts → notify students |

---

## Redis Data Model

All keys are namespaced under `live:quiz:{quiz_id}:`.

| Key | Type | Description |
|-----|------|-------------|
| `live:quiz:{id}:meta` | String (JSON) | Serialised quiz + questions for fast evaluation |
| `live:quiz:{id}:leaderboard` | Sorted Set | `member=student_id`, `score=points` |
| `live:quiz:{id}:students` | Hash | `field=student_id`, `value=display name` |
| `live:quiz:{id}:attempt:{sid}:answers` | Hash | `field=question_id`, `value=answer JSON` |
| `live:quiz:{id}:attempt:{sid}:points` | String | Running point total for one student |
| `live:answer_queue` | List | FIFO queue of `{ quiz_id, student_id, points_earned }` jobs |
| `live:quiz:{id}:ended` | Pub/Sub channel | Published by `endlivequiz`; payload = attempt map |

All live keys carry a 6-hour TTL and are deleted when the educator ends the quiz.

---

## Live Quiz Flow

### Educator side

1. Create a class → share `secret_key` with students
2. Create a quiz with `is_live: true`
3. Add questions (SCQ / MCQ / Integer) with point values
4. Wait for students to join, then start accepting answers
5. Call **End Quiz** → attempts written to DB → `quiz_ended` event fired → students redirected to results

### Student side

1. Join class with `secret_key`
2. Open quiz → `GET /takelivequiz` registers you in Redis (leaderboard + names hash)
3. Answer questions — each submit:
   - Evaluated instantly in the API
   - Answer saved to Redis hash (idempotent)
   - Points incremented in Redis
   - Job pushed to answer queue
4. WebSocket worker dequeues job → updates sorted set → broadcasts new leaderboard to all room members
5. After last question → **Finish Quiz** → `LiveQuizComplete` waiting page
6. When educator ends quiz → socket `quiz_ended` event → student routed to full results

---

## Environment Variables

### `server/.env`

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/goquiz"

# Redis connection string
REDIS_URL="redis://localhost:6379"

# JWT signing secret (use a long random string in production)
JWT_SECRET="your-secret-here"
```

### `websocket/.env`

```env
# Must point to the same Redis instance as the Next.js server
REDIS_URL="redis://localhost:6379"
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/GoQuiz.git
cd GoQuiz
```

### 2. Set up the database

```bash
cd server
cp .env.example .env          # fill in DATABASE_URL, REDIS_URL, JWT_SECRET
npx prisma generate           # generate Prisma client
npx prisma db push            # push schema to your database
```

### 3. Install dependencies

```bash
# Next.js server
cd server
npm install

# WebSocket server
cd ../websocket
npm install
```

### 4. Start Redis

```bash
# If using Docker:
docker run -d -p 6379:6379 redis:7

# Or start your local Redis instance
redis-server
```

### 5. Start the WebSocket server

```bash
cd websocket
node index.js
# → [ws] server on port 8002
# → [worker] started, listening on live:answer_queue
```

### 6. Start the Next.js dev server

```bash
cd server
npm run dev
# → Ready on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running in Production

### Next.js

```bash
cd server
npm run build
npm start          # runs on port 3000
```

### WebSocket server

Use a process manager like PM2:

```bash
npm install -g pm2
cd websocket
pm2 start index.js --name goquiz-ws
pm2 save
```

### Environment checklist

- [ ] `JWT_SECRET` is a cryptographically random 32+ character string
- [ ] `DATABASE_URL` uses SSL in production (`?sslmode=require`)
- [ ] `REDIS_URL` is a private/internal endpoint (not exposed publicly)
- [ ] CORS origin in `websocket/index.js` updated to your production URL
- [ ] `NEXT_PUBLIC_WS_URL` set in `server/.env` to point to your WebSocket server

```env
# server/.env (production addition)
NEXT_PUBLIC_WS_URL="https://ws.yourdomain.com"
```
