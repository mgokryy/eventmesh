var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.get('/bookings', async (req, res) => {
  const result = await pool.query('SELECT * FROM bookings');
  res.json(result.rows);
});

router.post('/bookings', async (req, res) => {
  const { event_id, user_name, quantity } = req.body;

  if (!event_id || !user_name || !quantity) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const result = await pool.query(
    'INSERT INTO bookings (event_id, user_name, quantity) VALUES ($1, $2, $3) RETURNING *',
    [event_id, user_name, quantity]
  );

  res.json(result.rows[0]);
});

module.exports = router;
