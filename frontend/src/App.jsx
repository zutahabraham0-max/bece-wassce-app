import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [careers, setCareers] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Question form state
  const [year, setYear] = useState('');
  const [examType, setExamType] = useState('BECE');
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');

  // Career form state
  const [program, setProgram] = useState('');
  const [careerTitle, setCareerTitle] = useState('');
  const [careerDescription, setCareerDescription] = useState('');

  // Material form state
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');

  useEffect(() => {
    fetch('https://bece-wassce-backend.onrender.com/subjects')
      .then(res => res.json())
      .then(data => setSubjects(data));
  }, []);

  const loadSubjectData = (subjectId) => {
    setSelectedSubject(subjectId);

    fetch(`https://bece-wassce-backend.onrender.com/questions?subject_id=${subjectId}`)
      .then(res => res.json())
      .then(data => setQuestions(data));

    fetch(`https://bece-wassce-backend.onrender.com/careers?subject_id=${subjectId}`)
      .then(res => res.json())
      .then(data => setCareers(data));

    fetch(`https://bece-wassce-backend.onrender.com/materials?subject_id=${subjectId}`)
      .then(res => res.json())
      .then(data => setMaterials(data));
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    fetch('https://bece-wassce-backend.onrender.com/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_id: selectedSubject,
        year: Number(year),
        exam_type: examType,
        question_text: questionText,
        answer_text: answerText,
      }),
    })
      .then(res => res.json())
      .then(() => {
        setYear('');
        setQuestionText('');
        setAnswerText('');
        loadSubjectData(selectedSubject);
      });
  };

  const handleAddCareer = (e) => {
    e.preventDefault();
    fetch('https://bece-wassce-backend.onrender.com/careers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_id: selectedSubject,
        program,
        career_title: careerTitle,
        description: careerDescription,
      }),
    })
      .then(res => res.json())
      .then(() => {
        setProgram('');
        setCareerTitle('');
        setCareerDescription('');
        loadSubjectData(selectedSubject);
      });
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    fetch('https://bece-wassce-backend.onrender.com/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_id: selectedSubject,
        title: materialTitle,
        content: materialContent,
      }),
    })
      .then(res => res.json())
      .then(() => {
        setMaterialTitle('');
        setMaterialContent('');
        loadSubjectData(selectedSubject);
      });
  };
const handleDeleteQuestion = (id) => {
    if (window.confirm('Delete this question? This cannot be undone.')) {
      fetch(`https://bece-wassce-backend.onrender.com/questions/${id}`, { method: 'DELETE' })
        .then(() => loadSubjectData(selectedSubject));
    }
  };

  const handleDeleteCareer = (id) => {
    if (window.confirm('Delete this career? This cannot be undone.')) {
      fetch(`https://bece-wassce-backend.onrender.com/careers/${id}`, { method: 'DELETE' })
        .then(() => loadSubjectData(selectedSubject));
    }
  };

  const handleDeleteMaterial = (id) => {
    if (window.confirm('Delete this material? This cannot be undone.')) {
      fetch(`https://bece-wassce-backend.onrender.com/materials/${id}`, { method: 'DELETE' })
        .then(() => loadSubjectData(selectedSubject));
    }
  };


  const activeSubject = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="app">
      <header className="masthead">
        <p className="eyebrow">Ghana &middot; JHS &amp; SHS</p>
        <h1>BECE / WASSCE Past Questions</h1>
        <p>A running record of past questions, worked answers, study notes, and career paths.</p>
      </header>

      <h2 className="section-title">Subjects</h2>
      <ul className="subject-grid">
        {subjects.map(subject => (
          <li key={subject.id}>
            <button
              className={`subject-btn ${selectedSubject === subject.id ? 'active' : ''}`}
              onClick={() => loadSubjectData(subject.id)}
            >
              {subject.name}
              <span className="level-tag">{subject.level}</span>
            </button>
          </li>
        ))}
      </ul>

      {selectedSubject && (
        <>
          {/* QUESTIONS */}
          <h2 className="section-title">
            Questions {activeSubject ? `— ${activeSubject.name}` : ''}
          </h2>

          {questions.length === 0 && (
            <p className="empty-note">No questions recorded yet for this subject.</p>
          )}

         {questions.map(q => (
            <div className="question-card" key={q.id}>
              <p className="meta">{q.exam_type} {q.year}</p>
              <p className="q-text">{q.question_text}</p>
              <p className="answer">Answer: {q.answer_text}</p>
              <button className="delete-btn" onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
            </div>
          ))}

          <h2 className="section-title">Add a New Question</h2>
          <form className="q-form" onSubmit={handleAddQuestion}>
            <div className="field">
              <label>Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
            </div>
            <div className="field">
              <label>Exam Type</label>
              <select value={examType} onChange={(e) => setExamType(e.target.value)}>
                <option value="BECE">BECE</option>
                <option value="WASSCE">WASSCE</option>
              </select>
            </div>
            <div className="field">
              <label>Question</label>
              <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
            </div>
            <div className="field">
              <label>Answer</label>
              <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} required />
            </div>
            <button type="submit">Add Question</button>
          </form>

          {/* CAREERS */}
          <h2 className="section-title">
            Careers {activeSubject ? `— ${activeSubject.name}` : ''}
          </h2>

          {careers.length === 0 && (
            <p className="empty-note">No careers recorded yet for this subject.</p>
          )}

          {careers.map(c => (
            <div className="question-card" key={c.id}>
              <p className="meta">{c.program}</p>
              <p className="q-text"><strong>{c.career_title}</strong></p>
              <p className="answer">{c.description}</p>
              <button className="delete-btn" onClick={() => handleDeleteCareer(c.id)}>Delete</button>
            </div>
          ))}

          <h2 className="section-title">Add a New Career</h2>
          <form className="q-form" onSubmit={handleAddCareer}>
            <div className="field">
              <label>Program (e.g. General Science, Business)</label>
              <input type="text" value={program} onChange={(e) => setProgram(e.target.value)} required />
            </div>
            <div className="field">
              <label>Career Title</label>
              <input type="text" value={careerTitle} onChange={(e) => setCareerTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea value={careerDescription} onChange={(e) => setCareerDescription(e.target.value)} required />
            </div>
            <button type="submit">Add Career</button>
          </form>

          {/* MATERIALS */}
          <h2 className="section-title">
            Learning Materials {activeSubject ? `— ${activeSubject.name}` : ''}
          </h2>

          {materials.length === 0 && (
            <p className="empty-note">No learning materials yet for this subject.</p>
          )}

         {materials.map(m => (
            <div className="question-card" key={m.id}>
              <p className="q-text"><strong>{m.title}</strong></p>
              <p className="answer">{m.content}</p>
              <button className="delete-btn" onClick={() => handleDeleteMaterial(m.id)}>Delete</button>
            </div>
          ))}

          <h2 className="section-title">Add Learning Material</h2>
          <form className="q-form" onSubmit={handleAddMaterial}>
            <div className="field">
              <label>Title</label>
              <input type="text" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Content / Notes</label>
              <textarea value={materialContent} onChange={(e) => setMaterialContent(e.target.value)} required />
            </div>
            <button type="submit">Add Material</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;