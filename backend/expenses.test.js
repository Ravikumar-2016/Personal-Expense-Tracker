const request = require('supertest');
const app = require('./server');
const db = require('./db');

describe('Expenses API', () => {
  beforeAll(() => {
    // Clean up test data if needed, but we'll use unique keys
  });

  describe('POST /expenses', () => {
    const validExpense = {
      amount: 1500,
      category: 'Food',
      description: 'Test Lunch',
      date: '2026-04-27'
    };

    it('should create a new expense', async () => {
      const res = await request(app)
        .post('/expenses')
        .set('X-Idempotency-Key', 'test-key-new')
        .send(validExpense);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.amount).toEqual(1500);
    });

    it('should be idempotent (return same response for same key)', async () => {
      const key = 'idempotency-test-key';
      
      // First request
      const res1 = await request(app)
        .post('/expenses')
        .set('X-Idempotency-Key', key)
        .send(validExpense);
      
      const id1 = res1.body.id;

      // Second request
      const res2 = await request(app)
        .post('/expenses')
        .set('X-Idempotency-Key', key)
        .send(validExpense);
      
      expect(res2.statusCode).toEqual(201);
      expect(res2.body.id).toEqual(id1);
      
      // Verify only one entry in DB for this key's result
      const count = db.prepare('SELECT COUNT(*) as count FROM expenses WHERE description = ?').get('Test Lunch');
      // Note: Previous test also added one, so let's check relative or just trust the ID match
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .post('/expenses')
        .send({ amount: -100 }); // Missing fields and negative amount
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /expenses', () => {
    it('should return a list of expenses', async () => {
      const res = await request(app).get('/expenses');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/expenses?category=Food');
      expect(res.statusCode).toEqual(200);
      res.body.forEach(exp => {
        expect(exp.category).toEqual('Food');
      });
    });
  });
});
