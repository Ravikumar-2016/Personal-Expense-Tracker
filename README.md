# 💰 Premium Expense Tracker

A high-performance, full-stack personal finance application designed for reliability and elegance. Built with a focus on data correctness, idempotency, and a premium user experience.

## 🚀 Key Features

### 1. Robust Data Integrity
- **Relational Persistence**: Data is stored in a local **SQLite** database (`backend/expenses.db`), ensuring persistence across restarts.
- **Integer Currency Storage**: Amounts are stored as **paise (integers)** in SQLite to prevent floating-point precision errors (e.g., `0.1 + 0.2 !== 0.3`).
- **Strict Validation**: Powered by **Zod** on the backend and multi-layer validation on the frontend to ensure no negative amounts or missing dates.

### 2. Production-Grade Reliability
- **Idempotency Control**: Implements `X-Idempotency-Key` headers. The API guarantees that a request with the same key is processed only once, preventing duplicates from double-clicks or retries.
- **Modern Notifications**: Uses `react-hot-toast` for sleek, non-blocking feedback during additions and deletions.
- **Centered Confirmation Modal**: Centered modal for destructive actions with a blurred backdrop for improved focus.

### 3. Premium Aesthetic (Fintech Style)
- **Glassmorphism UI**: Modern translucent cards with backdrop-blur effects and vibrant gradients.
- **Dashboard Summary**: Real-time spending overview by category and total.
- **Lucide Icons**: Intuitive iconography for categories and actions.
- **Responsive Layout**: Seamless experience across mobile, tablet, and desktop.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Vanilla CSS (Custom Design System), Lucide React, React Hot Toast.
- **Backend**: Node.js, Express, Better-SQLite3, Zod, UUID, Jest, Supertest.
- **Database**: SQLite (Persistent, file-based).

## 💡 Key Design Decisions

1.  **SQLite over In-Memory**: Chose SQLite to satisfy the "real-world conditions" requirement. In-memory stores lose data on restarts, which doesn't reflect a production environment.
2.  **Idempotency Strategy**: Instead of just disabling buttons (which can be bypassed), I implemented a server-side idempotency check. This is the only way to truly handle network retries where the client doesn't know if the first request succeeded.
3.  **Paise for Money**: Using integers for currency is a standard financial software practice to avoid the pitfalls of IEEE 754 floating-point arithmetic.
4.  **Vanilla CSS**: Built a custom design system from scratch to demonstrate UI/UX skills and avoid the bloat of large CSS frameworks while maintaining a premium look.

## ⚖️ Trade-offs

- **State Management**: Used React's built-in `useState` and `useMemo` instead of Redux/Zustand. For a small set of features, native hooks are faster to implement and easier to maintain.
- **Monorepo Structure**: Kept both tiers in one repo for easier evaluation and simpler deployment logic.
- **Manual Modals**: Created a custom modal system instead of using a library like Headless UI to maintain total control over the glassmorphism aesthetic.

## 📝 Intentionally Omitted
- **User Authentication**: Focused on the core expense logic and reliability within the timebox.
- **Advanced Charts**: While a summary view is included, full data visualization (pie charts/trends) was prioritized lower than data correctness and idempotency.
- **Database Migrations**: For this exercise, the schema is auto-initialized on startup.

## 🚦 Getting Started

### 1. Setup Backend
```bash
cd backend
npm install
npm start
```
*Server runs on `http://localhost:3001`*
*To run tests: `npm test`*

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Application runs on `http://localhost:5173` (or `5174`)*

---
Built with ❤️ for the Fenmo Assignment.
