const express = require('express');
const supabase = require('../db/supabase');
const router = express.Router();

// GET all transactions with optional filters
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    let q = supabase.from('transactions').select('*');
    if (year)  q = q.filter('date', 'gte', `${year}-01-01`).filter('date', 'lte', `${year}-12-31`);
    if (month) {
      const y = year || new Date().getFullYear();
      const m = String(month).padStart(2, '0');
      const last = new Date(y, month, 0).getDate();
      q = q.filter('date', 'gte', `${y}-${m}-01`).filter('date', 'lte', `${y}-${m}-${last}`);
    }
    q = q.order('date', { ascending: false }).order('created_at', { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET summary (monthly)
router.get('/summary', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const m = String(month).padStart(2, '0');
    const last = new Date(year, month, 0).getDate();

    const { data, error } = await supabase.from('transactions').select('type,amount')
      .filter('date', 'gte', `${year}-${m}-01`)
      .filter('date', 'lte', `${year}-${m}-${last}`);
    if (error) throw error;

    const summary = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
    data.forEach(r => {
      if (r.type === 'income') { summary.income += parseFloat(r.amount); summary.incomeCount++; }
      else { summary.expense += parseFloat(r.amount); summary.expenseCount++; }
    });
    summary.balance = summary.income - summary.expense;
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET weekly summary
router.get('/weekly', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const m = String(month).padStart(2, '0');
    const last = new Date(year, month, 0).getDate();

    const { data, error } = await supabase.from('transactions').select('type,amount,date')
      .filter('date', 'gte', `${year}-${m}-01`)
      .filter('date', 'lte', `${year}-${m}-${last}`);
    if (error) throw error;

    const weekMap = {};
    data.forEach(r => {
      const d = new Date(r.date);
      const week = Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7);
      const key = `${week}-${r.type}`;
      if (!weekMap[key]) weekMap[key] = { week, type: r.type, total: 0 };
      weekMap[key].total += parseFloat(r.amount);
    });
    res.json(Object.values(weekMap).sort((a, b) => a.week - b.week));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET category breakdown
router.get('/categories', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const m = String(month).padStart(2, '0');
    const last = new Date(year, month, 0).getDate();

    const { data, error } = await supabase.from('transactions').select('type,amount,category')
      .filter('date', 'gte', `${year}-${m}-01`)
      .filter('date', 'lte', `${year}-${m}-${last}`);
    if (error) throw error;

    const catMap = {};
    data.forEach(r => {
      const key = `${r.category}-${r.type}`;
      if (!catMap[key]) catMap[key] = { category: r.category, type: r.type, total: 0 };
      catMap[key].total += parseFloat(r.amount);
    });
    res.json(Object.values(catMap).sort((a, b) => b.total - a.total));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new transaction
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    if (!type || !amount || !category || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase.from('transactions')
      .insert({ type, amount: parseFloat(amount), category, description: description || null, date })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const { data, error } = await supabase.from('transactions')
      .update({ type, amount: parseFloat(amount), category, description: description || null, date })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('transactions')
      .delete().eq('id', req.params.id).select('id').single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
