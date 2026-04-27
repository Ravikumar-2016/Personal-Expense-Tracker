import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './index.css';

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other'];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('date_desc');

  // Form state
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter) queryParams.append('category', filter);
      if (sort) queryParams.append('sort', sort);

      const response = await fetch(`http://localhost:3001/expenses?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('Could not load expenses. Please check if the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, sort]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const idempotencyKey = uuidv4();
    const payload = {
      ...form,
      amount: Math.round(parseFloat(form.amount) * 100) // Convert to paise
    };

    try {
      const response = await fetch('http://localhost:3001/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.[0]?.message || 'Failed to add expense');
      }

      setForm({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0) / 100;

  return (
    <div className="app-container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>
          Expense <span style={{ color: 'var(--accent-primary)' }}>Tracker</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal finances with ease.</p>
      </header>

      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <section className="glass form-card animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Add Expense</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                required 
                value={form.amount}
                onChange={(e) => setForm({...form, amount: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select 
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea 
                placeholder="What was this for?" 
                required 
                rows="3"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Date</label>
              <input 
                type="date" 
                required 
                value={form.date}
                onChange={(e) => setForm({...form, date: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
          {error && <p style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
        </section>

        <section className="glass list-container animate-fade-in" style={{ gridColumn: 'span 2' }}>
          <div className="controls">
            <h2 style={{ fontSize: '1.5rem' }}>History</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select 
                style={{ width: 'auto' }} 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select 
                style={{ width: 'auto' }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="date_desc">Newest First</option>
                <option value="none">Default (Recent)</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading expenses...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id}>
                      <td data-label="Date">{new Date(expense.date).toLocaleDateString()}</td>
                      <td data-label="Category"><span className="category-badge">{expense.category}</span></td>
                      <td data-label="Description">{expense.description}</td>
                      <td data-label="Amount" className="amount" style={{ textAlign: 'right' }}>
                        ₹{(expense.amount / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No expenses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total:</span>
            <span className="total-display">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
