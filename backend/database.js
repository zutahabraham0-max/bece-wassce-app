require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function setupTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      level TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      subject_id INTEGER REFERENCES subjects(id),
      year INTEGER,
      exam_type TEXT,
      question_text TEXT NOT NULL,
      answer_text TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS careers (
      id SERIAL PRIMARY KEY,
      subject_id INTEGER REFERENCES subjects(id),
      program TEXT,
      career_title TEXT NOT NULL,
      description TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id SERIAL PRIMARY KEY,
      subject_id INTEGER REFERENCES subjects(id),
      title TEXT NOT NULL,
      content TEXT
    );
  `);

  console.log('Database and tables created successfully!');
}

module.exports = { pool, setupTables };