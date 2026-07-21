const express = require('express');
const db = require('./database');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('BECE/WASSCE App backend is running!');
});

// Get all subjects
app.get('/subjects', (req, res) => {
  const subjects = db.prepare('SELECT * FROM subjects').all();
  res.json(subjects);
});

// Add a new subject
app.post('/subjects', (req, res) => {
  const { name, level } = req.body;
  const stmt = db.prepare('INSERT INTO subjects (name, level) VALUES (?, ?)');
  const result = stmt.run(name, level);
  res.json({ id: result.lastInsertRowid, name, level });
});
// Delete a subject by id
app.delete('/subjects/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
  res.json({ message: `Subject ${id} deleted` });
});
// Get all questions (optionally filter by subject)
app.get('/questions', (req, res) => {
  const { subject_id } = req.query;
  let questions;
  if (subject_id) {
    questions = db.prepare('SELECT * FROM questions WHERE subject_id = ?').all(subject_id);
  } else {
    questions = db.prepare('SELECT * FROM questions').all();
  }
  res.json(questions);
});

// Add a new question
app.post('/questions', (req, res) => {
  const { subject_id, year, exam_type, question_text, answer_text } = req.body;
  const stmt = db.prepare(
    'INSERT INTO questions (subject_id, year, exam_type, question_text, answer_text) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(subject_id, year, exam_type, question_text, answer_text);
  res.json({ id: result.lastInsertRowid, subject_id, year, exam_type, question_text, answer_text });
});

// Delete a question by id
app.delete('/questions/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM questions WHERE id = ?').run(id);
  res.json({ message: `Question ${id} deleted` });
});
// Get all careers (optionally filter by subject)
app.get('/careers', (req, res) => {
  const { subject_id } = req.query;
  let careers;
  if (subject_id) {
    careers = db.prepare('SELECT * FROM careers WHERE subject_id = ?').all(subject_id);
  } else {
    careers = db.prepare('SELECT * FROM careers').all();
  }
  res.json(careers);
});

// Add a new career
app.post('/careers', (req, res) => {
  const { subject_id, program, career_title, description } = req.body;
  const stmt = db.prepare(
    'INSERT INTO careers (subject_id, program, career_title, description) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(subject_id, program, career_title, description);
  res.json({ id: result.lastInsertRowid, subject_id, program, career_title, description });
});

// Delete a career by id
app.delete('/careers/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM careers WHERE id = ?').run(id);
  res.json({ message: `Career ${id} deleted` });
});

// Get all materials (optionally filter by subject)
app.get('/materials', (req, res) => {
  const { subject_id } = req.query;
  let materials;
  if (subject_id) {
    materials = db.prepare('SELECT * FROM materials WHERE subject_id = ?').all(subject_id);
  } else {
    materials = db.prepare('SELECT * FROM materials').all();
  }
  res.json(materials);
});

// Add new material
app.post('/materials', (req, res) => {
  const { subject_id, title, content } = req.body;
  const stmt = db.prepare(
    'INSERT INTO materials (subject_id, title, content) VALUES (?, ?, ?)'
  );
  const result = stmt.run(subject_id, title, content);
  res.json({ id: result.lastInsertRowid, subject_id, title, content });
});

// Delete material by id
app.delete('/materials/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM materials WHERE id = ?').run(id);
  res.json({ message: `Material ${id} deleted` });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});