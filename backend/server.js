const express = require('express');
const cors = require('cors');
const { pool, setupTables } = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized: invalid admin key' });
  }
  next();
}

// Test route
app.get('/', (req, res) => {
  res.send('BECE/WASSCE App backend is running!');
});
app.post('/admin/verify', requireAdmin, (req, res) => {
  res.json({ success: true });
});

// ---------- USER AUTH ----------

app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ user, token });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'An account with this email already exists.' });
    } else {
      res.status(500).json({ error: 'Signup failed.' });
    }
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

function requireUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not logged in.' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired session.' });
    req.userId = decoded.userId;
    next();
  });
}

app.post('/quiz-results', requireUser, async (req, res) => {
  const { subject_id, score, total } = req.body;
  const result = await pool.query(
    'INSERT INTO quiz_results (user_id, subject_id, score, total) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.userId, subject_id, score, total]
  );
  res.json(result.rows[0]);
});

app.get('/quiz-results', requireUser, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY taken_at DESC',
    [req.userId]
  );
  res.json(result.rows);
});

// ---------- SUBJECTS ----------

app.get('/subjects', async (req, res) => {
  const result = await pool.query('SELECT * FROM subjects ORDER BY id');
  res.json(result.rows);
});

app.post('/subjects',requireAdmin, async (req, res) => {
  const { name, level } = req.body;
  const result = await pool.query(
    'INSERT INTO subjects (name, level) VALUES ($1, $2) RETURNING *',
    [name, level]
  );
  res.json(result.rows[0]);
});

app.delete('/subjects/:id',requireAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM subjects WHERE id = $1', [id]);
  res.json({ message: `Subject ${id} deleted` });
});

// ---------- QUESTIONS ----------

app.get('/questions', async (req, res) => {
  const { subject_id } = req.query;
  let result;
  if (subject_id) {
    result = await pool.query('SELECT * FROM questions WHERE subject_id = $1 ORDER BY id', [subject_id]);
  } else {
    result = await pool.query('SELECT * FROM questions ORDER BY id');
  }
  res.json(result.rows);
});

app.post('/questions', requireAdmin, async (req, res) => {
  const { subject_id, year, exam_type, question_text, answer_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  const result = await pool.query(
    `INSERT INTO questions (subject_id, year, exam_type, question_text, answer_text, option_a, option_b, option_c, option_d, correct_option)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [subject_id, year, exam_type, question_text, answer_text, option_a, option_b, option_c, option_d, correct_option]
  );
  res.json(result.rows[0]);
});

app.delete('/questions/:id',requireAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM questions WHERE id = $1', [id]);
  res.json({ message: `Question ${id} deleted` });
});

// ---------- CAREERS ----------

app.get('/careers', async (req, res) => {
  const { subject_id } = req.query;
  let result;
  if (subject_id) {
    result = await pool.query('SELECT * FROM careers WHERE subject_id = $1 ORDER BY id', [subject_id]);
  } else {
    result = await pool.query('SELECT * FROM careers ORDER BY id');
  }
  res.json(result.rows);
});

app.post('/careers',requireAdmin, async (req, res) => {
  const { subject_id, program, career_title, description } = req.body;
  const result = await pool.query(
    `INSERT INTO careers (subject_id, program, career_title, description)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [subject_id, program, career_title, description]
  );
  res.json(result.rows[0]);
});

app.delete('/careers/:id',requireAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM careers WHERE id = $1', [id]);
  res.json({ message: `Career ${id} deleted` });
});

// ---------- MATERIALS ----------

app.get('/materials', async (req, res) => {
  const { subject_id } = req.query;
  let result;
  if (subject_id) {
    result = await pool.query('SELECT * FROM materials WHERE subject_id = $1 ORDER BY id', [subject_id]);
  } else {
    result = await pool.query('SELECT * FROM materials ORDER BY id');
  }
  res.json(result.rows);
});

app.post('/materials',requireAdmin, async (req, res) => {
  const { subject_id, title, content } = req.body;
  const result = await pool.query(
    `INSERT INTO materials (subject_id, title, content) VALUES ($1, $2, $3) RETURNING *`,
    [subject_id, title, content]
  );
  res.json(result.rows[0]);
});

app.delete('/materials/:id',requireAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM materials WHERE id = $1', [id]);
  res.json({ message: `Material ${id} deleted` });
});

// ---------- START SERVER ----------

setupTables()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to set up database tables:', err);
  });