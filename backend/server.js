const express = require('express');
const cors = require('cors');
const { pool, setupTables } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('BECE/WASSCE App backend is running!');
});

// ---------- SUBJECTS ----------

app.get('/subjects', async (req, res) => {
  const result = await pool.query('SELECT * FROM subjects ORDER BY id');
  res.json(result.rows);
});

app.post('/subjects', async (req, res) => {
  const { name, level } = req.body;
  const result = await pool.query(
    'INSERT INTO subjects (name, level) VALUES ($1, $2) RETURNING *',
    [name, level]
  );
  res.json(result.rows[0]);
});

app.delete('/subjects/:id', async (req, res) => {
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

app.post('/questions', async (req, res) => {
  const { subject_id, year, exam_type, question_text, answer_text } = req.body;
  const result = await pool.query(
    `INSERT INTO questions (subject_id, year, exam_type, question_text, answer_text)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [subject_id, year, exam_type, question_text, answer_text]
  );
  res.json(result.rows[0]);
});

app.delete('/questions/:id', async (req, res) => {
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

app.post('/careers', async (req, res) => {
  const { subject_id, program, career_title, description } = req.body;
  const result = await pool.query(
    `INSERT INTO careers (subject_id, program, career_title, description)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [subject_id, program, career_title, description]
  );
  res.json(result.rows[0]);
});

app.delete('/careers/:id', async (req, res) => {
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

app.post('/materials', async (req, res) => {
  const { subject_id, title, content } = req.body;
  const result = await pool.query(
    `INSERT INTO materials (subject_id, title, content) VALUES ($1, $2, $3) RETURNING *`,
    [subject_id, title, content]
  );
  res.json(result.rows[0]);
});

app.delete('/materials/:id', async (req, res) => {
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