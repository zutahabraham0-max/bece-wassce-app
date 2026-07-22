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

  // User auth state
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [quizResults, setQuizResults] = useState([]);

  const [showPassword, setShowPassword] = useState(false);

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

  // Edit state
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestion, setEditQuestion] = useState({});

  const [editingCareerId, setEditingCareerId] = useState(null);
  const [editCareer, setEditCareer] = useState({});

  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editMaterial, setEditMaterial] = useState({});
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editSubject, setEditSubject] = useState({});

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('All');

  useEffect(() => {
    fetch(`${API_URL}/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data));

    const savedKey = sessionStorage.getItem('adminKey');
    if (savedKey) {
      verifyAdminKey(savedKey, true);
    }

   const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('userToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setUserToken(savedToken);
      fetchQuizResults(savedToken);
    }
  }, []);

  const fetchQuizResults = (token) => {
    fetch(`${API_URL}/quiz-results`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setQuizResults(data));
  };

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
    const quizQuestions = questions.filter(q => q.option_a);
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex(prev => prev + 1);
      setQuizSelected(null);
    } else {
      setQuizFinished(true);
      saveQuizProgress(selectedSubject, quizScore + (quizSelected === quizQuestions[quizIndex].correct_option ? 1 : 0), quizQuestions.length);
    }
  };

  const saveQuizProgress = (subjectId, score, total) => {
    if (user && userToken) {
      // Logged in — save to the database
      fetch(`${API_URL}/quiz-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ subject_id: subjectId, score, total }),
      }).then(() => fetchQuizResults(userToken));
    } else {
      // Not logged in — fall back to localStorage
      const stored = JSON.parse(localStorage.getItem('quizProgress') || '{}');
      const existing = stored[subjectId] || { attempts: 0, bestScore: 0, bestTotal: total };
      stored[subjectId] = {
        attempts: existing.attempts + 1,
        lastScore: score,
        lastTotal: total,
        bestScore: Math.max(existing.bestScore, score),
        bestTotal: total,
      };
      localStorage.setItem('quizProgress', JSON.stringify(stored));
    }
  };

  const getQuizProgress = (subjectId) => {
    const stored = JSON.parse(localStorage.getItem('quizProgress') || '{}');
    return stored[subjectId] || null;
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

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
    const body = authMode === 'signup'
      ? { name: authName, email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword };

    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong.');
        return data;
      })
      .then(({ user, token }) => {
        setUser(user);
        setUserToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userToken', token);
        fetchQuizResults(token);
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
      })
      .catch((err) => setAuthError(err.message));
  };

  const handleUserLogout = () => {
    setUser(null);
    setUserToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
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

  const startEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setEditQuestion({ ...q });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditQuestion({});
  };

  const saveEditQuestion = () => {
    fetch(`${API_URL}/questions/${editingQuestionId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(editQuestion),
    })
      .then(res => res.json())
      .then(() => {
        setEditingQuestionId(null);
        loadSubjectData(selectedSubject);
      });
  };

  const startEditCareer = (c) => {
    setEditingCareerId(c.id);
    setEditCareer({ ...c });
  };
  const cancelEditCareer = () => {
    setEditingCareerId(null);
    setEditCareer({});
  };
  const saveEditCareer = () => {
    fetch(`${API_URL}/careers/${editingCareerId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(editCareer),
    })
      .then(res => res.json())
      .then(() => {
        setEditingCareerId(null);
        loadSubjectData(selectedSubject);
      });
  };

  const startEditMaterial = (m) => {
    setEditingMaterialId(m.id);
    setEditMaterial({ ...m });
  };
  const cancelEditMaterial = () => {
    setEditingMaterialId(null);
    setEditMaterial({});
  };
  const saveEditMaterial = () => {
    fetch(`${API_URL}/materials/${editingMaterialId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(editMaterial),
    })
      .then(res => res.json())
      .then(() => {
        setEditingMaterialId(null);
        loadSubjectData(selectedSubject);
      });
  };

const startEditSubject = (s) => {
    setEditingSubjectId(s.id);
    setEditSubject({ ...s });
  };
  const cancelEditSubject = () => {
    setEditingSubjectId(null);
    setEditSubject({});
  };
  const saveEditSubject = () => {
    fetch(`${API_URL}/subjects/${editingSubjectId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(editSubject),
    })
      .then(res => res.json())
      .then((updated) => {
        setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s));
        setEditingSubjectId(null);
      });
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

  const availableYears = ['All', ...new Set(questions.map(q => q.year))].sort();

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'All' || q.year === Number(filterYear);
    return matchesSearch && matchesYear;
  });

  return (
    <div className="app">
      <header className="masthead">
        <p className="eyebrow">Ghana &middot; JHS &amp; SHS</p>
        <h1>BECE / WASSCE Past Questions</h1>
        <p>A running record of past questions, worked answers, study notes, and career paths.</p>
      </header>

      {!user ? (
        <form className="q-form" onSubmit={handleAuthSubmit} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              style={{
                background: authMode === 'login' ? 'var(--primary)' : 'transparent',
                color: authMode === 'login' ? '#fff' : 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.4rem 0.9rem',
                cursor: 'pointer',
              }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              style={{
                background: authMode === 'signup' ? 'var(--primary)' : 'transparent',
                color: authMode === 'signup' ? '#fff' : 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.4rem 0.9rem',
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'signup' && (
            <div className="field">
              <label>Name</label>
              <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
          </div>
         <div className="field">
            <label>Password</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0 0.8rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--ink-soft)',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {authError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{authError}</p>}
          <button type="submit">{authMode === 'signup' ? 'Create Account' : 'Log In'}</button>
        </form>
      ) : (
        <div className="q-form" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ fontWeight: 700 }}>Welcome, {user.name}!</span>
            <button type="button" className="delete-btn" onClick={handleUserLogout}>Log out</button>
          </div>
          {quizResults.length > 0 && (
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>
                Your Quiz History
              </p>
              {quizResults.slice(0, 5).map(r => {
                const subj = subjects.find(s => s.id === r.subject_id);
                return (
                  <p key={r.id} style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}>
                    {subj ? subj.name : `Subject ${r.subject_id}`}: {r.score}/{r.total}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}

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
            {editingSubjectId === subject.id ? (
              <div className="q-form">
                <div className="field">
                  <label>Name</label>
                  <input type="text" value={editSubject.name || ''} onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })} />
                </div>
                <div className="field">
                  <label>Level</label>
                  <select value={editSubject.level || 'JHS'} onChange={(e) => setEditSubject({ ...editSubject, level: e.target.value })}>
                    <option value="JHS">JHS</option>
                    <option value="SHS">SHS</option>
                  </select>
                </div>
                <button onClick={saveEditSubject}>Save</button>
                <button className="delete-btn" onClick={cancelEditSubject} style={{ marginLeft: '0.5rem' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <button
                  className={`subject-btn ${selectedSubject === subject.id ? 'active' : ''}`}
                  onClick={() => loadSubjectData(subject.id)}
                >
                  {subject.name}
                  <span className="level-tag">{subject.level}</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); startEditSubject(subject); }}
                    style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: 'transparent', border: 'none',
                      fontSize: '0.7rem', color: 'var(--ink-soft)', cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
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
            <>
              <button
                className="q-form"
                style={{
                  display: 'block',
                  width: '100%',
                  marginBottom: '0.6rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  background: 'var(--card)',
                  textAlign: 'left',
                  border: '1px solid var(--border)',
                }}
                onClick={startQuiz}
              >
                Take Quiz ({questions.filter(q => q.option_a).length} questions)
              </button>
              {getQuizProgress(selectedSubject) && (
                <p className="empty-note" style={{ marginBottom: '1.5rem' }}>
                  Best score: {getQuizProgress(selectedSubject).bestScore} / {getQuizProgress(selectedSubject).bestTotal}
                  {' '}&middot; Attempts: {getQuizProgress(selectedSubject).attempts}
                </p>
              )}
            </>
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
                                color: 'var(--ink)',
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
          

          {questions.length > 0 && (
            <div className="q-form" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="field" style={{ flex: 2, minWidth: '200px' }}>
                <label>Search Questions</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type a keyword..."
                />
              </div>
              <div className="field" style={{ flex: 1, minWidth: '120px' }}>
                <label>Filter by Year</label>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {questions.length === 0 && (
            <p className="empty-note">No questions recorded yet for this subject.</p>
          )}

          {questions.length > 0 && filteredQuestions.length === 0 && (
            <p className="empty-note">No questions match your search.</p>
          )}
{filteredQuestions.map(q => (
            <div className="question-card" key={q.id}>
              {editingQuestionId === q.id ? (
                <>
                  <div className="field">
                    <label>Question</label>
                    <textarea
                      value={editQuestion.question_text}
                      onChange={(e) => setEditQuestion({ ...editQuestion, question_text: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Answer</label>
                    <textarea
                      value={editQuestion.answer_text}
                      onChange={(e) => setEditQuestion({ ...editQuestion, answer_text: e.target.value })}
                    />
                  </div>
                  {editQuestion.option_a !== undefined && editQuestion.option_a !== null && (
                    <>
                      <div className="field">
                        <label>Option A</label>
                        <input type="text" value={editQuestion.option_a || ''} onChange={(e) => setEditQuestion({ ...editQuestion, option_a: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>Option B</label>
                        <input type="text" value={editQuestion.option_b || ''} onChange={(e) => setEditQuestion({ ...editQuestion, option_b: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>Option C</label>
                        <input type="text" value={editQuestion.option_c || ''} onChange={(e) => setEditQuestion({ ...editQuestion, option_c: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>Option D</label>
                        <input type="text" value={editQuestion.option_d || ''} onChange={(e) => setEditQuestion({ ...editQuestion, option_d: e.target.value })} />
                      </div>
                      <div className="field">
                        <label>Correct Option</label>
                        <select value={editQuestion.correct_option || 'A'} onChange={(e) => setEditQuestion({ ...editQuestion, correct_option: e.target.value })}>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </>
                  )}
                  <button onClick={saveEditQuestion}>Save</button>
                  <button className="delete-btn" onClick={cancelEditQuestion} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </>
              ) : (
                <>
                  <p className="meta">{q.exam_type} {q.year}</p>
                  <p className="q-text">{q.question_text}</p>
                  <p className="answer">Answer: {q.answer_text}</p>
                  {isAdmin && (
                    <>
                      <button onClick={() => startEditQuestion(q)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteQuestion(q.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                    </>
                  )}
                </>
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
              {editingCareerId === c.id ? (
                <>
                  <div className="field">
                    <label>Program</label>
                    <input type="text" value={editCareer.program || ''} onChange={(e) => setEditCareer({ ...editCareer, program: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Career Title</label>
                    <input type="text" value={editCareer.career_title || ''} onChange={(e) => setEditCareer({ ...editCareer, career_title: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Description</label>
                    <textarea value={editCareer.description || ''} onChange={(e) => setEditCareer({ ...editCareer, description: e.target.value })} />
                  </div>
                  <button onClick={saveEditCareer}>Save</button>
                  <button className="delete-btn" onClick={cancelEditCareer} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </>
              ) : (
                <>
                  <p className="meta">{c.program}</p>
                  <p className="q-text"><strong>{c.career_title}</strong></p>
                  <p className="answer">{c.description}</p>
                  {isAdmin && (
                    <>
                      <button onClick={() => startEditCareer(c)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteCareer(c.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                    </>
                  )}
                </>
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
              {editingMaterialId === m.id ? (
                <>
                  <div className="field">
                    <label>Title</label>
                    <input type="text" value={editMaterial.title || ''} onChange={(e) => setEditMaterial({ ...editMaterial, title: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Content / Notes</label>
                    <textarea value={editMaterial.content || ''} onChange={(e) => setEditMaterial({ ...editMaterial, content: e.target.value })} />
                  </div>
                  <button onClick={saveEditMaterial}>Save</button>
                  <button className="delete-btn" onClick={cancelEditMaterial} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </>
              ) : (
                <>
                  <p className="q-text"><strong>{m.title}</strong></p>
                  <p className="answer">{m.content}</p>
                  {isAdmin && (
                    <>
                      <button onClick={() => startEditMaterial(m)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteMaterial(m.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                    </>
                  )}
                </>
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