const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// GET all transactions with optional filters
router.get('/', async (req, res) => {
  try {
    const { month, year, week } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (year) {
      params.push(year);
      query += ` AND EXTRACT(YEAR FROM date) = $${params.length}`;
    }
    if (month) {
      params.push(month);
      query += ` AND EXTRACT(MONTH FROM date) = $${params.length}`;
    }
    if (week) {
      params.push(week);
      query += ` AND EXTRACT(WEEK FROM date) = $${params.length}`;
    }

    query += ' ORDER BY date DESC, created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET summary (monthly)
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const params = [year || new Date().getFullYear(), month || new Date().getMonth() + 1];

    const result = await pool.query(
      `SELECT
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1
        AND EXTRACT(MONTH FROM date) = $2
      GROUP BY type`,
      params
    );

    const summary = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
    result.rows.forEach(row => {
      if (row.type === 'income') {
        summary.income = parseFloat(row.total);
        summary.incomeCount = parseInt(row.count);
      } else {
        summary.expense = parseFloat(row.total);
        summary.expenseCount = parseInt(row.count);
      }
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
    const { month, year } = req.query;
    const params = [year || new Date().getFullYear(), month || new Date().getMonth() + 1];

    const result = await pool.query(
      `SELECT
        EXTRACT(WEEK FROM date) as week,
        type,
        SUM(amount) as total
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1
        AND EXTRACT(MONTH FROM date) = $2
      GROUP BY week, type
      ORDER BY week`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET category breakdown
router.get('/categories', async (req, res) => {
  try {
    const { month, year } = req.query;
    const params = [year || new Date().getFullYear(), month || new Date().getMonth() + 1];

    const result = await pool.query(
      `SELECT category, type, SUM(amount) as total
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1
        AND EXTRACT(MONTH FROM date) = $2
      GROUP BY category, type
      ORDER BY total DESC`,
      params
    );
    res.json(result.rows);
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
    const result = await pool.query(
      'INSERT INTO transactions (type, amount, category, description, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [type, amount, category, description || null, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const result = await pool.query(
      'UPDATE transactions SET type=$1, amount=$2, category=$3, description=$4, date=$5 WHERE id=$6 RETURNING *',
      [type, amount, category, description || null, date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM transactions WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
