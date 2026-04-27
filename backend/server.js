const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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
    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO expenses (id, amount, category, description, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, validatedData.amount, validatedData.category, validatedData.description, validatedData.date);

    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    res.status(201).json(newExpense);
  } catch (error) {
    if (error.errors || error.issues) {
      return res.status(400).json({ errors: error.errors || error.issues });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /expenses/:id
app.delete('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  
  res.status(204).send();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
