// Run with: node bulk-add.js
// Adds a batch of practice questions to your live backend in one go.

const API_URL = 'https://bece-wassce-backend.onrender.com';
const ADMIN_KEY = 'QWERTYUIOP1234567890'; // your admin password

const questions = [
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What is the term for the process by which citizens choose their leaders through voting?",
    answer_text: "Election, the democratic process of choosing leaders.",
    option_a: 'Election', option_b: 'Coup', option_c: 'Referendum', option_d: 'Appointment', correct_option: 'A'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What is the main aim of the United Nations?",
    answer_text: "To maintain international peace and security.",
    option_a: 'To promote trade only', option_b: 'To maintain international peace and security', option_c: 'To control world currencies', option_d: 'To manage sports events', correct_option: 'B'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What is meant by 'globalization'?",
    answer_text: "The increasing interconnectedness of countries through trade, culture, and technology.",
    option_a: 'The isolation of countries', option_b: 'The increasing interconnectedness of nations', option_c: 'A type of government', option_d: 'A religious practice', correct_option: 'B'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "Which organization is responsible for regional integration in West Africa?",
    answer_text: "ECOWAS (Economic Community of West African States).",
    option_a: 'African Union', option_b: 'ECOWAS', option_c: 'United Nations', option_d: 'World Bank', correct_option: 'B'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What is the term for a system of government where power is shared between a central and regional governments?",
    answer_text: "Federalism.",
    option_a: 'Federalism', option_b: 'Monarchy', option_c: 'Dictatorship', option_d: 'Theocracy', correct_option: 'A'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What is the main cause of rural-urban migration in developing countries?",
    answer_text: "The search for better job opportunities and social amenities in urban areas.",
    option_a: 'Better weather', option_b: 'Search for jobs and amenities', option_c: 'Government orders', option_d: 'Religious festivals', correct_option: 'B'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What does GDP stand for?",
    answer_text: "Gross Domestic Product, a measure of a country's economic output.",
    option_a: 'Gross Domestic Product', option_b: 'General Development Plan', option_c: 'Global Distribution Process', option_d: 'Government Debt Policy', correct_option: 'A'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What is the term for laws that apply to everyone regardless of status?",
    answer_text: "Rule of law, a key principle of democratic governance.",
    option_a: 'Rule of law', option_b: 'Martial law', option_c: 'Common law', option_d: 'Civil law', correct_option: 'A'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What is a key feature of a democratic system of government?",
    answer_text: "Regular free and fair elections.",
    option_a: 'One-party rule', option_b: 'Regular free and fair elections', option_c: 'Hereditary leadership', option_d: 'Military control', correct_option: 'B'
  },
  {
    subject_id: 10, year: 2024, exam_type: 'Practice',
    question_text: "What is the term for the study of human populations?",
    answer_text: "Demography.",
    option_a: 'Demography', option_b: 'Geography', option_c: 'Sociology', option_d: 'Anthropology', correct_option: 'A'
  },
];

async function run() {
  for (const q of questions) {
    try {
      const res = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(q),
      });
      const data = await res.json();
      console.log('Added:', data.question_text || data.error);
    } catch (err) {
      console.error('Failed to add question:', q.question_text, err.message);
    }
  }
  console.log('Done!');
}

run();