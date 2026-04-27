import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Utensils, Car, Zap, Music, ShoppingBag, MoreHorizontal, 
  PlusCircle, Filter, ArrowUpDown, AlertCircle, TrendingDown, Trash2 
} from 'lucide-react';
import './index.css';

const CATEGORIES = [
  { id: 'Food', icon: Utensils, class: 'badge-food' },
  { id: 'Transport', icon: Car, class: 'badge-transport' },
  { id: 'Utilities', icon: Zap, class: 'badge-utilities' },
  { id: 'Entertainment', icon: Music, class: 'badge-entertainment' },
  { id: 'Shopping', icon: ShoppingBag, class: 'badge-shopping' },
  { id: 'Other', icon: MoreHorizontal, class: 'badge-other' },
];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('date_desc');

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Form state
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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
    } catch (err) {
      toast.error('Could not load expenses. Server may be offline.');
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

    setFieldErrors({});

    const amountVal = parseFloat(form.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setFieldErrors({ amount: 'Please enter a valid positive amount' });
      return;
    }

    if (!form.description.trim()) {
      setFieldErrors({ description: 'Description is required' });
      return;
    }

    setSubmitting(true);

    const idempotencyKey = uuidv4();
    const payload = {
      ...form,
      amount: Math.round(amountVal * 100)
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

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const errors = {};
          result.errors.forEach(err => errors[err.path] = err.message);
          setFieldErrors(errors);
        } else {
          throw new Error(result.error || 'Failed to add expense');
        }
        return;
      }

      toast.success('Expense added successfully!');
      setForm({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchExpenses();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3001/expenses/${expenseToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    }
  };

  const categoryTotals = useMemo(() => {
    return expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
  }, [expenses]);

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0) / 100;

  return (
    <div className="app-container">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
          },
          success: { iconTheme: { primary: '#38bdf8', secondary: '#1e293b' } },
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="glass modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <Trash2 size={48} color="var(--danger)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Delete Expense?</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              This action cannot be undone. Are you sure you want to remove this transaction?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>
          Expense <span style={{ color: 'var(--accent-primary)' }}>Tracker</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Premium personal finance management.</p>
      </header>

      <div className="summary-grid animate-fade-in">
        <div className="glass summary-card">
          <h4>Total Spending</h4>
          <div className="value" style={{ color: 'var(--accent-primary)' }}>₹{total.toLocaleString()}</div>
        </div>
        {CATEGORIES.slice(0, 3).map(cat => (
          <div key={cat.id} className="glass summary-card">
            <h4>{cat.id}</h4>
            <div className="value">₹{((categoryTotals[cat.id] || 0) / 100).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <section className="glass form-card animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <PlusCircle size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.5rem' }}>Add Expense</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                className={fieldErrors.amount ? 'input-error' : ''}
                value={form.amount}
                onChange={(e) => setForm({...form, amount: e.target.value})}
              />
              {fieldErrors.amount && <span className="error-text">{fieldErrors.amount}</span>}
            </div>
            <div className="input-group">
              <label>Category</label>
              <select 
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
              >
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea 
                placeholder="What was this for?" 
                rows="2"
                className={fieldErrors.description ? 'input-error' : ''}
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
              />
              {fieldErrors.description && <span className="error-text">{fieldErrors.description}</span>}
            </div>
            <div className="input-group">
              <label>Date</label>
              <input 
                type="date" 
                value={form.date}
                onChange={(e) => setForm({...form, date: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Processing...' : 'Add Expense'}
            </button>
          </form>
        </section>

        <section className="glass list-container animate-fade-in" style={{ gridColumn: 'span 2' }}>
          <div className="controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TrendingDown size={24} color="var(--accent-secondary)" />
              <h2 style={{ fontSize: '1.5rem' }}>History</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <select 
                  style={{ width: 'auto', paddingLeft: '2.5rem' }} 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
                </select>
              </div>
              <div style={{ position: 'relative' }}>
                <ArrowUpDown size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <select 
                  style={{ width: 'auto', paddingLeft: '2.5rem' }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="date_desc">Newest First</option>
                  <option value="none">Default</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Updating history...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => {
                    const category = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[5];
                    const Icon = category.icon;
                    return (
                      <tr key={expense.id}>
                        <td data-label="Date">{new Date(expense.date).toLocaleDateString()}</td>
                        <td data-label="Category">
                          <span className={`category-badge ${category.class}`}>
                            <Icon size={14} />
                            {expense.category}
                          </span>
                        </td>
                        <td data-label="Description">{expense.description}</td>
                        <td data-label="Amount" className="amount" style={{ textAlign: 'right' }}>
                          ₹{(expense.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <button 
                            className="btn-danger" 
                            onClick={() => {
                              setExpenseToDelete(expense.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Expense"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No transactions recorded.
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
