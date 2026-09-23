import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://bece-wassce-backend.onrender.com';

function App() {
  const [view, setView] = useState('home'); // home, pastSubjects, pastQuestions, practiceSubjects, practiceQuestions, materialsSubjects, materials, careers, account
  const [menuOpen, setMenuOpen] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [careers, setCareers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [allCareers, setAllCareers] = useState([]);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // User auth state
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [quizResults, setQuizResults] = useState([]);

  // Reset password
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

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
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(600);
  const [quizDurationMinutes, setQuizDurationMinutes] = useState(10);

  // Edit state
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestion, setEditQuestion] = useState({});
  const [editingCareerId, setEditingCareerId] = useState(null);
  const [editCareer, setEditCareer] = useState({});
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editMaterial, setEditMaterial] = useState({});
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editSubject, setEditSubject] = useState({});

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('All');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl && window.location.pathname === '/reset-password') {
      setResetToken(tokenFromUrl);
    }

    fetch(`${API_URL}/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data));

    fetch(`${API_URL}/careers`)
      .then(res => res.json())
      .then(data => setAllCareers(data));

    const savedKey = sessionStorage.getItem('adminKey');
    if (savedKey) verifyAdminKey(savedKey, true);

    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('userToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setUserToken(savedToken);
      fetchQuizResults(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!quizMode || quizFinished) return;
    if (quizTimeLeft <= 0) {
      const quizQuestions = questions.filter(q => q.option_a);
      finishQuiz(quizAnswers, quizQuestions);
      return;
    }
    const timer = setTimeout(() => setQuizTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [quizMode, quizFinished, quizTimeLeft]);

  const fetchQuizResults = (token) => {
    fetch(`${API_URL}/quiz-results`, { headers: { 'Authorization': `Bearer ${token}` } })
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

  const goTo = (newView) => {
    setView(newView);
    setMenuOpen(false);
    setSelectedSubject(null);
    setSearchTerm('');
    setFilterYear('All');
  };

  const pickSubject = (subjectId, nextView) => {
    loadSubjectData(subjectId);
    setView(nextView);
  };

  const startQuiz = () => {
    setQuizMode(true);
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizScore(0);
    setQuizFinished(false);
    setQuizAnswers({});
    setQuizTimeLeft(quizDurationMinutes * 60);
  };

  const exitQuiz = () => setQuizMode(false);

  const selectQuizAnswer = (option) => {
    if (quizSelected) return;
    setQuizSelected(option);
    setQuizAnswers(prev => ({ ...prev, [quizIndex]: option }));
  };

  const finishQuiz = (finalAnswers, quizQuestions) => {
    let correctCount = 0;
    quizQuestions.forEach((q, i) => {
      if (finalAnswers[i] === q.correct_option) correctCount++;
    });
    setQuizScore(correctCount);
    setQuizFinished(true);
    saveQuizProgress(selectedSubject, correctCount, quizQuestions.length);
  };

  const nextQuizQuestion = () => {
    const quizQuestions = questions.filter(q => q.option_a);
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex(prev => prev + 1);
      setQuizSelected(null);
    } else {
      const finalAnswers = { ...quizAnswers, [quizIndex]: quizSelected };
      finishQuiz(finalAnswers, quizQuestions);
    }
  };

  const saveQuizProgress = (subjectId, score, total) => {
    if (user && userToken) {
      fetch(`${API_URL}/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ subject_id: subjectId, score, total }),
      }).then(() => fetchQuizResults(userToken));
    } else {
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
    fetch(`${API_URL}/admin/verify`, { method: 'POST', headers: { 'x-admin-key': key } })
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
      .catch(() => { if (!silent) setAdminError('Could not reach server.'); });
  };

  const handleAdminLogin = (e) => { e.preventDefault(); verifyAdminKey(adminInput, false); };
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

  const handleForgotPassword = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail }),
    })
      .then(res => res.json())
      .then((data) => setForgotMessage(data.message));
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword }),
    })
      .then(res => res.json())
      .then((data) => {
        if (data.error) {
          setResetMessage(data.error);
        } else {
          setResetMessage('Password reset! You can now log in with your new password.');
          setTimeout(() => { window.location.href = '/'; }, 3000);
        }
      });
  };

  const handleUserLogout = () => {
    setUser(null);
    setUserToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
  };

  const authHeaders = { 'Content-Type': 'application/json', 'x-admin-key': adminKey };

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
        subject_id: selectedSubject, year: Number(year), exam_type: examType,
        question_text: questionText, answer_text: answerText,
        option_a: optionA, option_b: optionB, option_c: optionC, option_d: optionD,
        correct_option: correctOption,
      }),
    })
      .then(res => res.json())
      .then(() => {
        setYear(''); setQuestionText(''); setAnswerText('');
        setOptionA(''); setOptionB(''); setOptionC(''); setOptionD(''); setCorrectOption('A');
        loadSubjectData(selectedSubject);
      });
  };

  const handleAddCareer = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/careers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ subject_id: selectedSubject, program, career_title: careerTitle, description: careerDescription }),
    })
      .then(res => res.json())
      .then(() => {
        setProgram(''); setCareerTitle(''); setCareerDescription('');
        loadSubjectData(selectedSubject);
        fetch(`${API_URL}/careers`).then(res => res.json()).then(data => setAllCareers(data));
      });
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/materials`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ subject_id: selectedSubject, title: materialTitle, content: materialContent }),
    })
      .then(res => res.json())
      .then(() => {
        setMaterialTitle(''); setMaterialContent('');
        loadSubjectData(selectedSubject);
      });
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm('Delete this question? This cannot be undone.')) {
      fetch(`${API_URL}/questions/${id}`, { method: 'DELETE', headers: authHeaders })
        .then(() => loadSubjectData(selectedSubject));
    }
  };

  const startEditQuestion = (q) => { setEditingQuestionId(q.id); setEditQuestion({ ...q }); };
  const cancelEditQuestion = () => { setEditingQuestionId(null); setEditQuestion({}); };
  const saveEditQuestion = () => {
    fetch(`${API_URL}/questions/${editingQuestionId}`, {
      method: 'PUT', headers: authHeaders, body: JSON.stringify(editQuestion),
    })
      .then(res => res.json())
      .then(() => { setEditingQuestionId(null); loadSubjectData(selectedSubject); });
  };

  const startEditCareer = (c) => { setEditingCareerId(c.id); setEditCareer({ ...c }); };
  const cancelEditCareer = () => { setEditingCareerId(null); setEditCareer({}); };
  const saveEditCareer = () => {
    fetch(`${API_URL}/careers/${editingCareerId}`, {
      method: 'PUT', headers: authHeaders, body: JSON.stringify(editCareer),
    })
      .then(res => res.json())
      .then(() => {
        setEditingCareerId(null);
        loadSubjectData(selectedSubject);
        fetch(`${API_URL}/careers`).then(res => res.json()).then(data => setAllCareers(data));
      });
  };

  const startEditMaterial = (m) => { setEditingMaterialId(m.id); setEditMaterial({ ...m }); };
  const cancelEditMaterial = () => { setEditingMaterialId(null); setEditMaterial({}); };
  const saveEditMaterial = () => {
    fetch(`${API_URL}/materials/${editingMaterialId}`, {
      method: 'PUT', headers: authHeaders, body: JSON.stringify(editMaterial),
    })
      .then(res => res.json())
      .then(() => { setEditingMaterialId(null); loadSubjectData(selectedSubject); });
  };

  const startEditSubject = (s) => { setEditingSubjectId(s.id); setEditSubject({ ...s }); };
  const cancelEditSubject = () => { setEditingSubjectId(null); setEditSubject({}); };
  const saveEditSubject = () => {
    fetch(`${API_URL}/subjects/${editingSubjectId}`, {
      method: 'PUT', headers: authHeaders, body: JSON.stringify(editSubject),
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
        .then(() => {
          loadSubjectData(selectedSubject);
          fetch(`${API_URL}/careers`).then(res => res.json()).then(data => setAllCareers(data));
        });
    }
  };

  const handleDeleteMaterial = (id) => {
    if (window.confirm('Delete this material? This cannot be undone.')) {
      fetch(`${API_URL}/materials/${id}`, { method: 'DELETE', headers: authHeaders })
        .then(() => loadSubjectData(selectedSubject));
    }
  };

  const activeSubject = subjects.find(s => s.id === selectedSubject);

  const careersByProgram = allCareers.reduce((acc, c) => {
    const prog = c.program || 'Other';
    if (!acc[prog]) acc[prog] = [];
    acc[prog].push(c);
    return acc;
  }, {});

  const availableYears = ['All', ...new Set(questions.map(q => q.year))].sort();

  // Split by exam_type: Past = BECE/WASSCE, Practice = Practice
  const isPastView = view === 'pastQuestions';
  const baseQuestions = questions.filter(q =>
    isPastView ? q.exam_type !== 'Practice' : q.exam_type === 'Practice'
  );

  const filteredQuestions = baseQuestions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'All' || q.year === Number(filterYear);
    return matchesSearch && matchesYear;
  });

  // ---------- RESET PASSWORD SCREEN ----------
  if (resetToken) {
    return (
      <div className="app">
        <header className="masthead">
          <p className="eyebrow">Ghana &middot; JHS &amp; SHS</p>
          <h1>Reset Your Password</h1>
        </header>
        <form className="q-form" onSubmit={handleResetPassword}>
          <div className="field">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          {resetMessage && <p style={{ color: 'var(--success)', fontSize: '0.9rem' }}>{resetMessage}</p>}
          <button type="submit">Reset Password</button>
        </form>
      </div>
    );
  }

  // ---------- MENU OVERLAY ----------
  const Menu = () => (
    <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
      <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
        <button className="back-btn" onClick={() => setMenuOpen(false)}>✕ Close</button>
        <button className="nav-btn" onClick={() => goTo('pastSubjects')}>📄 Past Questions</button>
        <button className="nav-btn" onClick={() => goTo('practiceSubjects')}>✏️ Practice Questions</button>
        <button className="nav-btn" onClick={() => goTo('materialsSubjects')}>📚 Learning Materials</button>
        <button className="nav-btn" onClick={() => goTo('careers')}>💼 Career Paths</button>
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button className="nav-btn" onClick={() => goTo('account')}>
            {user ? `👤 ${user.name}` : '👤 Log In / Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );

  const MenuToggle = () => (
    <button className="menu-toggle" onClick={() => setMenuOpen(true)}>☰</button>
  );

  // ---------- HOME ----------
  if (view === 'home') {
    return (
      <div className="app">
        <MenuToggle />
        {menuOpen && <Menu />}
               <div className="hero">
                         <video className="hero-video" autoPlay loop muted playsInline>
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay"></div>
          <svg className="hero-illustration" viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Light rays rising from the book */}
            <line x1="120" y1="70" x2="70" y2="10" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
            <line x1="120" y1="70" x2="120" y2="4" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
            <line x1="120" y1="70" x2="170" y2="10" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
            <line x1="120" y1="70" x2="45" y2="35" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            <line x1="120" y1="70" x2="195" y2="35" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

            {/* Sparkles */}
            <path d="M40 55 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="var(--gold)" />
            <path d="M200 60 l2.5 6.5 6.5 2.5 -6.5 2.5 -2.5 6.5 -2.5 -6.5 -6.5 -2.5 6.5 -2.5 z" fill="var(--gold)" />
            <path d="M175 15 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="var(--gold)" opacity="0.85" />

            {/* Open book */}
            <path d="M120 78 L34 96 V150 L120 134 Z" fill="var(--primary)" />
            <path d="M120 78 L206 96 V150 L120 134 Z" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.5" />
            <line x1="46" y1="106" x2="104" y2="99" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1="46" y1="118" x2="104" y2="111" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1="46" y1="130" x2="104" y2="123" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1="136" y1="99" x2="192" y2="106" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="136" y1="111" x2="192" y2="118" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="136" y1="123" x2="192" y2="130" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <path d="M120 78 V134" stroke="var(--ink)" strokeWidth="2" opacity="0.15" />
          </svg>
          <p className="eyebrow">Ghana &middot; JHS &amp; SHS</p>
          <h1>BECE / WASSCE Past Questions</h1>
          <p>Tap the menu to explore past questions, practice quizzes, learning materials, and career paths.</p>
        </div>
      </div>
    );
  }

  // ---------- SUBJECT PICKER (shared for past/practice/materials) ----------
  const SubjectPicker = ({ nextView, title }) => (
    <div className="app">
      <MenuToggle />
      {menuOpen && <Menu />}
            <div className="page-header">
        <button className="back-btn" onClick={() => goTo('home')}>← Back to Home</button>
      </div>
      <h2 className="section-title">{title}</h2>
      <ul className="subject-grid">
        {subjects.map(subject => (
          <li key={subject.id}>
            <button className="subject-btn" onClick={() => pickSubject(subject.id, nextView)}>
              {subject.name}
              <span className="level-tag">{subject.level}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  if (view === 'pastSubjects') return <SubjectPicker nextView="pastQuestions" title="Past Questions — Choose a Subject" />;
  if (view === 'practiceSubjects') return <SubjectPicker nextView="practiceQuestions" title="Practice Questions — Choose a Subject" />;
  if (view === 'materialsSubjects') return <SubjectPicker nextView="materials" title="Learning Materials — Choose a Subject" />;

  // ---------- CAREERS PAGE ----------
  if (view === 'careers') {
    return (
      <div className="app">
        <MenuToggle />
        {menuOpen && <Menu />}
                <div className="page-header">
          <button className="back-btn" onClick={() => goTo('home')}>← Back to Home</button>
        </div>
        <h2 className="section-title">Career Paths by Programme</h2>
        {Object.keys(careersByProgram).length === 0 && <p className="empty-note">No careers added yet.</p>}
        {Object.entries(careersByProgram).map(([prog, careerList]) => (
          <div key={prog} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--primary)' }}>{prog}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary-soft)' }}>
                    <th style={{ textAlign: 'left', padding: '0.7rem', fontSize: '0.8rem' }}>Career</th>
                    <th style={{ textAlign: 'left', padding: '0.7rem', fontSize: '0.8rem' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '0.7rem', fontSize: '0.8rem' }}>Resources</th>
                  </tr>
                </thead>
                               <tbody>
                  {careerList.map(c => (
                    <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.7rem', fontWeight: 700, fontSize: '0.88rem', verticalAlign: 'top' }}>{c.career_title}</td>
                      <td style={{ padding: '0.7rem', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{c.description}</td>
                      <td style={{ padding: '0.7rem', verticalAlign: 'top' }}>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(c.career_title + ' career guide Ghana')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                          Learn more →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---------- ACCOUNT (LOGIN / ADMIN) ----------
  if (view === 'account') {
    return (
      <div className="app">
        <MenuToggle />
        {menuOpen && <Menu />}
                <div className="page-header">
          <button className="back-btn" onClick={() => goTo('home')}>← Back to Home</button>
        </div>

        {!user ? (
          <form className="q-form" onSubmit={handleAuthSubmit} style={{ marginBottom: '1rem' }}>
            {forgotMode && (
              <div style={{ marginBottom: '1rem' }}>
                <form className="q-form" onSubmit={handleForgotPassword}>
                  <p style={{ fontWeight: 700, marginBottom: '0.8rem' }}>Reset your password</p>
                  <div className="field">
                    <label>Email</label>
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                  </div>
                  {forgotMessage && <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{forgotMessage}</p>}
                  <button type="submit">Send Reset Link</button>
                  <button type="button" className="delete-btn" style={{ marginLeft: '0.5rem' }} onClick={() => { setForgotMode(false); setForgotMessage(''); }}>Cancel</button>
                </form>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button type="button" onClick={() => setAuthMode('login')} style={{ background: authMode === 'login' ? 'var(--primary)' : 'transparent', color: authMode === 'login' ? '#fff' : 'var(--ink)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.9rem', cursor: 'pointer' }}>Log In</button>
              <button type="button" onClick={() => setAuthMode('signup')} style={{ background: authMode === 'signup' ? 'var(--primary)' : 'transparent', color: authMode === 'signup' ? '#fff' : 'var(--ink)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.9rem', cursor: 'pointer' }}>Sign Up</button>
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
                <input type={showPassword ? 'text' : 'password'} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required style={{ flex: 1 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 0.8rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            {authMode === 'login' && (
              <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                <button type="button" onClick={() => setForgotMode(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Forgot password?</button>
              </p>
            )}
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
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>Your Quiz History</p>
                {quizResults.slice(0, 5).map(r => {
                  const subj = subjects.find(s => s.id === r.subject_id);
                  return <p key={r.id} style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}>{subj ? subj.name : `Subject ${r.subject_id}`}: {r.score}/{r.total}</p>;
                })}
              </div>
            )}
          </div>
        )}

        {!isAdmin ? (
          <form className="q-form" onSubmit={handleAdminLogin} style={{ marginBottom: '2rem' }}>
            <div className="field">
              <label>Admin Password (optional — leave blank to just browse)</label>
              <input type="password" value={adminInput} onChange={(e) => setAdminInput(e.target.value)} placeholder="Enter admin password to edit content" />
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

        {isAdmin && (
          <>
            <h2 className="section-title">Subjects (Admin)</h2>
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
                      <button className="subject-btn">{subject.name}<span className="level-tag">{subject.level}</span></button>
                      <button onClick={() => startEditSubject(subject)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', fontSize: '0.7rem', color: 'var(--ink-soft)', cursor: 'pointer' }}>Edit</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <form className="q-form" onSubmit={handleAddSubject} style={{ marginBottom: '2rem' }}>
              <div className="field">
                <label>New Subject Name</label>
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
      </div>
    );
  }

  // ---------- PAST / PRACTICE QUESTIONS ----------
  if (view === 'pastQuestions' || view === 'practiceQuestions') {
    return (
      <div className="app">
        <MenuToggle />
        {menuOpen && <Menu />}
                <div className="page-header">
          <button className="back-btn" onClick={() => goTo(isPastView ? 'pastSubjects' : 'practiceSubjects')}>← Choose a different subject</button>
        </div>
        <h2 className="section-title">
          {isPastView ? 'Past Questions' : 'Practice Questions'} {activeSubject ? `— ${activeSubject.name}` : ''}
        </h2>

        {!quizMode && baseQuestions.some(q => q.option_a) && (
          <>
            <div className="q-form" style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-soft)' }}>Time limit (minutes):</label>
              <input type="number" min="1" max="180" value={quizDurationMinutes} onChange={(e) => setQuizDurationMinutes(Number(e.target.value))} style={{ width: '80px', padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <button className="q-form" style={{ display: 'block', width: '100%', marginBottom: '0.6rem', cursor: 'pointer', fontWeight: 700, color: 'var(--ink)', background: 'var(--card)', textAlign: 'left', border: '1px solid var(--border)' }} onClick={startQuiz}>
              Take Quiz ({baseQuestions.filter(q => q.option_a).length} questions)
            </button>
            {getQuizProgress(selectedSubject) && (
              <p className="empty-note" style={{ marginBottom: '1.5rem' }}>
                Best score: {getQuizProgress(selectedSubject).bestScore} / {getQuizProgress(selectedSubject).bestTotal} &middot; Attempts: {getQuizProgress(selectedSubject).attempts}
              </p>
            )}
          </>
        )}

        {quizMode && (
          <div className="q-form" style={{ marginBottom: '2rem' }}>
            {!quizFinished ? (
              (() => {
                const quizQuestions = baseQuestions.filter(q => q.option_a);
                const current = quizQuestions[quizIndex];
                if (!current) return <p>No quiz questions available.</p>;
                return (
                  <>
                    <p className="meta">
                      Question {quizIndex + 1} of {quizQuestions.length}
                      {' '}&middot; Time left: {String(Math.floor(quizTimeLeft / 60)).padStart(2, '0')}:{String(quizTimeLeft % 60).padStart(2, '0')}
                    </p>
                    <p className="q-text" style={{ fontWeight: 700 }}>{current.question_text}</p>
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optionText = current[`option_${opt.toLowerCase()}`];
                      let bg = 'var(--card)';
                      if (quizSelected) {
                        if (opt === current.correct_option) bg = '#d1fadf';
                        else if (opt === quizSelected) bg = '#fde2e2';
                      }
                      return (
                        <button key={opt} onClick={() => selectQuizAnswer(opt)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: bg, color: 'var(--ink)', cursor: quizSelected ? 'default' : 'pointer' }}>
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
              })()
            ) : (
              <>
                <p className="q-text" style={{ fontWeight: 700 }}>Quiz complete! Score: {quizScore} / {baseQuestions.filter(q => q.option_a).length}</p>
                <button onClick={startQuiz}>Retry Quiz</button>
              </>
            )}
            <button className="delete-btn" style={{ marginTop: '1rem' }} onClick={exitQuiz}>Exit Quiz</button>
          </div>
        )}

        {baseQuestions.length > 0 && (
          <div className="q-form" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="field" style={{ flex: 2, minWidth: '200px' }}>
              <label>Search Questions</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Type a keyword..." />
            </div>
            <div className="field" style={{ flex: 1, minWidth: '120px' }}>
              <label>Filter by Year</label>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {baseQuestions.length === 0 && <p className="empty-note">No {isPastView ? 'past' : 'practice'} questions recorded yet for this subject.</p>}
        {baseQuestions.length > 0 && filteredQuestions.length === 0 && <p className="empty-note">No questions match your search.</p>}

        {filteredQuestions.map(q => (
          <div className="question-card" key={q.id}>
            {editingQuestionId === q.id ? (
              <>
                <div className="field"><label>Question</label><textarea value={editQuestion.question_text} onChange={(e) => setEditQuestion({ ...editQuestion, question_text: e.target.value })} /></div>
                <div className="field"><label>Answer</label><textarea value={editQuestion.answer_text} onChange={(e) => setEditQuestion({ ...editQuestion, answer_text: e.target.value })} /></div>
                {editQuestion.option_a !== undefined && editQuestion.option_a !== null && (
                  <>
                    <div className="field"><label>Option A</label><input type="text" value={editQuestion.option_a || ''} onChange={(e) => setEditQuestion({ ...editQuestion, option_a: e.target.value })} /></div>
                    <div className="field"><label>Option B</label><input type="text" value={editQuestion.option_b || ''} onChange={(e) => setEditQuestion({ ...editQuestion, option_b: e.target.value })} /></div>
                    <div className="field"><label>Option C</label><input type="text" value={editQuestion.option_c || ''} onChange={(e) => setEditQuestion({ ...editQuestion, option_c: e.target.value })} /></div>
                    <div className="field"><label>Option D</label><input type="text" value={editQuestion.option_d || ''} onChange={(e) => setEditQuestion({ ...editQuestion, option_d: e.target.value })} /></div>
                    <div className="field">
                      <label>Correct Option</label>
                      <select value={editQuestion.correct_option || 'A'} onChange={(e) => setEditQuestion({ ...editQuestion, correct_option: e.target.value })}>
                        <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
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
              <div className="field"><label>Year (leave as-is for Practice Questions)</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
              <div className="field">
                <label>Exam Type</label>
                <select value={examType} onChange={(e) => setExamType(e.target.value)}>
                  <option value="BECE">BECE</option><option value="WASSCE">WASSCE</option><option value="Practice">Practice Question</option>
                </select>
              </div>
              <div className="field"><label>Question</label><textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} required /></div>
              <div className="field"><label>Answer (explanation)</label><textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} required /></div>
              <div className="field"><label>Option A</label><input type="text" value={optionA} onChange={(e) => setOptionA(e.target.value)} required /></div>
              <div className="field"><label>Option B</label><input type="text" value={optionB} onChange={(e) => setOptionB(e.target.value)} required /></div>
              <div className="field"><label>Option C</label><input type="text" value={optionC} onChange={(e) => setOptionC(e.target.value)} required /></div>
              <div className="field"><label>Option D</label><input type="text" value={optionD} onChange={(e) => setOptionD(e.target.value)} required /></div>
              <div className="field">
                <label>Correct Option</label>
                <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}>
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
              </div>
              <button type="submit">Add Question</button>
            </form>
          </>
        )}
      </div>
    );
  }

  // ---------- LEARNING MATERIALS ----------
  if (view === 'materials') {
    return (
      <div className="app">
        <MenuToggle />
        {menuOpen && <Menu />}
                <div className="page-header">
          <button className="back-btn" onClick={() => goTo('materialsSubjects')}>← Choose a different subject</button>
        </div>
        <h2 className="section-title">Learning Materials {activeSubject ? `— ${activeSubject.name}` : ''}</h2>

        {materials.length === 0 && <p className="empty-note">No learning materials yet for this subject.</p>}

        {materials.map(m => (
          <div className="question-card" key={m.id}>
            {editingMaterialId === m.id ? (
              <>
                <div className="field"><label>Title</label><input type="text" value={editMaterial.title || ''} onChange={(e) => setEditMaterial({ ...editMaterial, title: e.target.value })} /></div>
                <div className="field"><label>Content / Notes</label><textarea value={editMaterial.content || ''} onChange={(e) => setEditMaterial({ ...editMaterial, content: e.target.value })} /></div>
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
              <div className="field"><label>Title</label><input type="text" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} required /></div>
              <div className="field"><label>Content / Notes</label><textarea value={materialContent} onChange={(e) => setMaterialContent(e.target.value)} required /></div>
              <button type="submit">Add Material</button>
            </form>
          </>
        )}
      </div>
    );
  }

  return null;
}

export default App;
