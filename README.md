# 💰 Premium Expense Tracker

A high-performance, full-stack personal finance application designed for reliability and elegance. Built with a focus on data correctness, idempotency, and a premium user experience.


## 🚀 Key Features

### 1. Robust Data Integrity
- **Relational Persistence**: Data is stored in a local **SQLite** database (`backend/expenses.db`), ensuring persistence across restarts.
- **Delete Support**: Easily remove entries with an integrated delete feature and confirmation checks.
- **Strict Validation**: Powered by **Zod** on the backend and multi-layer validation on the frontend.

### 2. Production-Grade Reliability
- **Idempotency Control**: Implements `X-Idempotency-Key` headers. The API guarantees that a request with the same key is processed only once.
- **Modern Notifications**: Uses `react-hot-toast` for sleek, non-blocking feedback during additions and deletions.
- **Confirm-to-Delete**: Integrated toast-based confirmation for a seamless deletion experience.

### 3. Premium Aesthetic (Fintech Style)
- **Enhanced Dropdowns**: Custom-styled selection inputs for a consistent, premium look across browsers.
- **Glassmorphism UI**: Modern translucent cards with backdrop-blur effects and vibrant gradients.
- **Lucide Icons**: Intuitive iconography for categories and actions.
- **Dashboard Summary**: Real-time spending overview by category and total.
- **Responsive Layout**: Seamless experience across mobile, tablet, and desktop.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Vanilla CSS (Custom Design System), Lucide React.
- **Backend**: Node.js, Express, Better-SQLite3, Zod, UUID.
- **Database**: SQLite (Persistent, file-based).

## 🚦 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### 1. Setup Backend
```bash
cd backend
npm install
npm run dev
```
*Server runs on `http://localhost:3001`*

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Application runs on `http://localhost:5173`*

## 📈 Design Decisions & Trade-offs

- **Why SQLite?**: It provides a real relational database experience without the overhead of setting up a separate server, making it perfect for this assignment's "production-like" requirement.
- **Why Vanilla CSS?**: To demonstrate a deep understanding of modern CSS features (Grid, Flexbox, Variables, Glassmorphism) without relying on utility frameworks like Tailwind.
- **Idempotency Strategy**: Each request generates a unique UUID on the frontend. If a user double-clicks or the page refreshes during a POST, the backend recognizes the duplicate key and returns the cached response instead of creating a double entry.

## 📝 Intentionally Omitted (Future Scope)
- **User Authentication**: Currently a single-user tool.
- **Data Export**: Export to CSV/PDF functionality.
- **Advanced Charts**: Visualizing trends using Recharts or D3.
- **Pagination**: Performance optimization for thousands of entries.
