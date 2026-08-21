# FoodSnap

FoodSnap is a MERN food-discovery application for customers and food partners.
The repository contains the Express/Mongoose API and a React/Vite frontend
foundation.

## Requirements

- Node.js 20+
- npm 10+
- Docker 27+
- MongoDB 7 (the recommended local setup is the Docker command below)

## Local setup

```bash
docker run -d --name foodsnap-mongo -p 27017:27017 mongo:7
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

If the MongoDB container already exists, use `docker start foodsnap-mongo`.
The API listens on `http://localhost:5000` by default.

In a second terminal, start the frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend listens on `http://localhost:5173` and uses `VITE_API_URL` for
the API base URL.

## Backend environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/foodsnap` | MongoDB connection |
| `JWT_SECRET` | required | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT lifetime |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS origin |
| `PUBLIC_BASE_URL` | `http://localhost:5000` | Base URL for uploaded files |

## Frontend environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | API base URL used by the frontend |

## API summary

All endpoints are under `/api`.

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `PATCH /users/me`, `PATCH /users/me/settings`
- `GET /partners`, `GET /partners/:id`, `PATCH /partners/me`
- `GET /foods`, `GET /foods/:id`, partner food CRUD, and food reviews
- `GET /reels`, partner reel CRUD, and `POST /reels/:id/view`
- `POST /likes`, `POST /saves`, and `GET /search`
- Cart CRUD, customer/partner order flows, and review update/delete
- `GET /analytics/overview` for partners and `POST /chat` for both roles

Protected endpoints use `Authorization: Bearer <token>`. Partner profile and
user photo uploads use multipart form fields named `logo` and `photo`.

## Seed data

Run `npm run seed` from `backend` to reset the local database and create demo
partners, customers, foods, reels, interactions, orders, and reviews. The
command prints the generated demo credentials when it completes.

## Demo credentials

The seed command prints the current credentials. The default seed accounts are:

- Customer: `maya@example.com` / `Password123!`
- Partner: `spice@example.com` / `Password123!`
