import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://bece-wassce-backend.onrender.com';

function App() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [careers, setCareers] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // Question form state
  const [year, setYear] = useState('');
  const [examType, setExamType] = useState('BECE');
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');

  // Career form state
  const [program, setProgram] = useState('');
  const [careerTitle, setCareerTitle] = useState('');
  const [careerDescription, setCareerDescription] = useState('');

  // Material form state
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');

  // Subject form state
  const [subjectName, setSubjectName] = useState('');
  const [subjectLevel, setSubjectLevel] = useState('JHS');
  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data));

    const savedKey = sessionStorage.getItem('adminKey');
    if (savedKey) {
      verifyAdminKey(savedKey, true);
    }
  }, []);

  const loadSubjectData = (subjectId) => {
    setSelectedSubject(subjectId);

    fetch(`${API_URL}/questions?subject_id=${subjectId}`)
      .then(res => res.json())
      .then(data => setQuestions(data));

    fetch(`${API_URL}/careers?subject_id=${subjectId}`)
      .then(res => res.json())
      .then(data => setCareers(data));

    fetch(`${API_URL}/materials?subject_id=${subjectId}`)
      .then(res => res.json())
      .then(data => setMaterials(data));
  };
  const startQuiz = () => {
    setQuizMode(true);
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const exitQuiz = () => {
    setQuizMode(false);
  };

  const selectQuizAnswer = (option) => {
    if (quizSelected) return; // already answered this question
    setQuizSelected(option);
    const current = questions[quizIndex];
    if (option === current.correct_option) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (quizIndex + 1 < questions.length) {
      setQuizIndex(prev => prev + 1);
      setQuizSelected(null);
    } else {
      setQuizFinished(true);
    }
  };

  const verifyAdminKey = (key, silent) => {
    fetch(`${API_URL}/admin/verify`, {
      method: 'POST',
      headers: { 'x-admin-key': key },
    })
      .then(res => {
        if (res.ok) {
          setIsAdmin(true);
          setAdminKey(key);
          setAdminError('');
          sessionStorage.setItem('adminKey', key);
        } else {
          if (!silent) setAdminError('Incorrect password.');
          sessionStorage.removeItem('adminKey');
        }
      })
      .catch(() => {
        if (!silent) setAdminError('Could not reach server.');
      });
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    verifyAdminKey(adminInput, false);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminKey('');
    setAdminInput('');
    sessionStorage.removeItem('adminKey');
  };

  const authHeaders = {
    'Content-Type': 'application/json',
    'x-admin-key': adminKey,
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/subjects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: subjectName, level: subjectLevel }),
    })
      .then(res => res.json())
      .then((newSubject) => {
        setSubjects(prev => [...prev, newSubject]);
        setSubjectName('');
      });
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/questions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        subject_id: selectedSubject,
        year: Number(year),
        exam_type: examType,
        question_text: questionText,
        answer_text: answerText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
      }),
    })
      .then(res => res.json())
      .then(() => {
        setYear('');
        setQuestionText('');
        setAnswerText('');
        setOptionA('');
        setOptionB('');
        setOptionC('');
        setOptionD('');
        setCorrectOption('A');
        loadSubjectData(selectedSubject);
      });
  };

  const handleAddCareer = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/careers`, {
      method: 'POST',
      headers: authHeaders,
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
    fetch(`${API_URL}/materials`, {
      method: 'POST',
      headers: authHeaders,
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
      fetch(`${API_URL}/questions/${id}`, { method: 'DELETE', headers: authHeaders })
        .then(() => loadSubjectData(selectedSubject));
    }
  };

  const handleDeleteCareer = (id) => {
    if (window.confirm('Delete this career? This cannot be undone.')) {
      fetch(`${API_URL}/careers/${id}`, { method: 'DELETE', headers: authHeaders })
        .then(() => loadSubjectData(selectedSubject));
    }
  };

  const handleDeleteMaterial = (id) => {
    if (window.confirm('Delete this material? This cannot be undone.')) {
      fetch(`${API_URL}/materials/${id}`, { method: 'DELETE', headers: authHeaders })
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

      {!isAdmin ? (
        <form className="q-form" onSubmit={handleAdminLogin} style={{ marginBottom: '2rem' }}>
          <div className="field">
            <label>Admin Password (optional — leave blank to just browse)</label>
            <input
              type="password"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              placeholder="Enter admin password to edit content"
            />
          </div>
          {adminError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{adminError}</p>}
          <button type="submit">Unlock Admin Tools</button>
        </form>
      ) : (
        <div className="q-form" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--success)' }}>Admin mode active</span>
          <button type="button" className="delete-btn" onClick={handleAdminLogout}>Log out</button>
        </div>
      )}

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

      {isAdmin && (
        <>
          <h2 className="section-title">Add a New Subject</h2>
          <form className="q-form" onSubmit={handleAddSubject}>
            <div className="field">
              <label>Subject Name</label>
              <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Level</label>
              <select value={subjectLevel} onChange={(e) => setSubjectLevel(e.target.value)}>
                <option value="JHS">JHS</option>
                <option value="SHS">SHS</option>
              </select>
            </div>
            <button type="submit">Add Subject</button>
          </form>
        </>
      )}

      {selectedSubject && (
        <><h2 className="section-title">
            Questions {activeSubject ? `— ${activeSubject.name}` : ''}
          </h2>

          {!quizMode && questions.some(q => q.option_a) && (
            <button className="q-form" style={{ display: 'block', marginBottom: '1.5rem', cursor: 'pointer', fontWeight: 700 }} onClick={startQuiz}>
              Take Quiz ({questions.filter(q => q.option_a).length} questions)
            </button>
          )}

          {quizMode && (
            <div className="q-form" style={{ marginBottom: '2rem' }}>
              {!quizFinished ? (
                <>
                  {(() => {
                    const quizQuestions = questions.filter(q => q.option_a);
                    const current = quizQuestions[quizIndex];
                    if (!current) return <p>No quiz questions available.</p>;
                    return (
                      <>
                        <p className="meta">Question {quizIndex + 1} of {quizQuestions.length}</p>
                        <p className="q-text" style={{ fontWeight: 700 }}>{current.question_text}</p>

                        {['A', 'B', 'C', 'D'].map(opt => {
                          const optionText = current[`option_${opt.toLowerCase()}`];
                          let bg = 'var(--card)';
                          if (quizSelected) {
                            if (opt === current.correct_option) bg = '#d1fadf';
                            else if (opt === quizSelected) bg = '#fde2e2';
                          }
                          return (
                            <button
                              key={opt}
                              onClick={() => selectQuizAnswer(opt)}
                              style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.7rem 1rem',
                                marginBottom: '0.5rem',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: bg,
                                cursor: quizSelected ? 'default' : 'pointer',
                              }}
                            >
                              <strong>{opt}.</strong> {optionText}
                            </button>
                          );
                        })}

                        {quizSelected && (
                          <button onClick={nextQuizQuestion} style={{ marginTop: '1rem' }}>
                            {quizIndex + 1 < quizQuestions.length ? 'Next Question' : 'Finish Quiz'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
                  <p className="q-text" style={{ fontWeight: 700 }}>
                    Quiz complete! Score: {quizScore} / {questions.filter(q => q.option_a).length}
                  </p>
                  <button onClick={startQuiz}>Retry Quiz</button>
                </>
              )}
              <button className="delete-btn" style={{ marginTop: '1rem' }} onClick={exitQuiz}>Exit Quiz</button>
            </div>
          )}
          

          {questions.length === 0 && (
            <p className="empty-note">No questions recorded yet for this subject.</p>
          )}

          {questions.map(q => (
            <div className="question-card" key={q.id}>
              <p className="meta">{q.exam_type} {q.year}</p>
              <p className="q-text">{q.question_text}</p>
              <p className="answer">Answer: {q.answer_text}</p>
              {isAdmin && (
                <button className="delete-btn" onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
              )}
            </div>
          ))}

          {isAdmin && (
            <>
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
                  <label>Answer (explanation)</label>
                  <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Option A</label>
                  <input type="text" value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Option B</label>
                  <input type="text" value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Option C</label>
                  <input type="text" value={optionC} onChange={(e) => setOptionC(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Option D</label>
                  <input type="text" value={optionD} onChange={(e) => setOptionD(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Correct Option</label>
                  <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <button type="submit">Add Question</button>
              </form>
            </>
          )}

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
              {isAdmin && (
                <button className="delete-btn" onClick={() => handleDeleteCareer(c.id)}>Delete</button>
              )}
            </div>
          ))}

          {isAdmin && (
            <>
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
            </>
          )}

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
              {isAdmin && (
                <button className="delete-btn" onClick={() => handleDeleteMaterial(m.id)}>Delete</button>
              )}
            </div>
          ))}

          {isAdmin && (
            <>
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
        </>
      )}
    </div>
  );
}

export default App;