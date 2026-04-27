# Expense Tracker

A robust, full-stack personal finance tool built with React, Express, and SQLite.

## Key Design Decisions

### 1. Data Integrity & Money Handling
- **Integer Storage**: Amounts are stored as integers (paise/cents) in the database to avoid floating-point arithmetic issues common with currencies.
- **SQLite Persistence**: Used SQLite for reliable, file-based persistence that supports SQL queries for efficient filtering and sorting.

### 2. Reliability & Idempotency
- **Idempotency Keys**: To handle network retries, browser refreshes, and double-clicks, the API implements idempotency using an `X-Idempotency-Key` header.
- **Client-Side Retries**: The frontend generates a unique UUID for each request attempt, ensuring that even if a request is sent multiple times due to a slow connection, it is only processed once.

### 3. User Experience (UX)
- **Glassmorphism Design**: A modern, premium aesthetic using CSS backdrop-filters and gradients.
- **Responsive Layout**: Works seamlessly on mobile and desktop using CSS Grid and Flexbox.
- **Visual Feedback**: Loading states, error messages, and animations provide clear feedback to the user.

## Trade-offs

- **Simplified State Management**: For a project of this scale, I used React's built-in `useState` and `useCallback` instead of more complex libraries like Redux or TanStack Query.
- **Monorepo Structure**: Both frontend and backend are in the same repository for ease of development and deployment, though in a large-scale production app, they might be separate.
- **Basic Validation**: While I implemented schema validation with Zod on the backend and basic HTML5 validation on the frontend, more complex business logic validation was omitted for the timebox.

## Future Improvements (Intentionally Omitted)

- **Authentication**: User accounts and secure login.
- **Advanced Analytics**: Charts and graphs for spending patterns.
- **Pagination**: The current implementation loads all expenses; for very large lists, pagination would be necessary.
- **Exporting Data**: Ability to export expenses as CSV or PDF.

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. `npm start` (Runs on port 3001)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173)
