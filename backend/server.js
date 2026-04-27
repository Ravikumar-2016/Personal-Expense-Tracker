const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Zod schema for validation
const expenseSchema = z.object({
  amount: z.number().int().positive(), // Amount in paise
  category: z.string().min(1),
  description: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Middleware for idempotency
const idempotencyMiddleware = (req, res, next) => {
  const key = req.headers['x-idempotency-key'];
  if (!key) return next();

  const record = db.prepare('SELECT * FROM idempotency_keys WHERE key = ?').get(key);
  if (record) {
    return res.status(record.response_status).json(JSON.parse(record.response_body));
  }

  // Intercept res.json to store the response
  const originalJson = res.json;
  res.json = function (body) {
    db.prepare('INSERT INTO idempotency_keys (key, response_status, response_body) VALUES (?, ?, ?)')
      .run(key, res.statusCode, JSON.stringify(body));
    return originalJson.call(this, body);
  };

  next();
};

// GET /expenses
app.get('/expenses', (req, res) => {
  const { category, sort } = req.query;
  let query = 'SELECT * FROM expenses';
  const params = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  if (sort === 'date_desc') {
    query += ' ORDER BY date DESC, created_at DESC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

  const expenses = db.prepare(query).all(...params);
  res.json(expenses);
});

// POST /expenses
app.post('/expenses', idempotencyMiddleware, (req, res) => {
  try {
    const validatedData = expenseSchema.parse(req.body);
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO expenses (id, amount, category, description, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, validatedData.amount, validatedData.category, validatedData.description, validatedData.date);

    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    res.status(201).json(newExpense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path[0],
        message: err.message
      }));
      return res.status(400).json({ errors: formattedErrors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
