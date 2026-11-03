// Run with: node bulk-add.js
const API_URL = 'https://bece-wassce-backend.onrender.com';
const ADMIN_KEY = 'QWERTYUIOP1234567890';
const ENDPOINT = '/questions';
const items = [
  {
    subject_id: 23, year: 2024, exam_type: 'Practice',
    question_text: "What is the purpose of a balanced meal?",
    answer_text: "To provide the body with all necessary nutrients in the right proportions for good health.",
    option_a: 'To make food taste better only', option_b: 'To provide the body with necessary nutrients', option_c: 'To reduce cooking time', option_d: 'To save money only', correct_option: 'B'
  },
  {
    subject_id: 23, year: 2024, exam_type: 'Practice',
    question_text: "What is 'hygiene' in food preparation?",
    answer_text: "Practices that keep food clean and safe from contamination.",
    option_a: 'Making food look attractive', option_b: 'Practices that keep food clean and safe', option_c: 'Cooking food quickly', option_d: 'Using expensive ingredients', correct_option: 'B'
  },
  {
    subject_id: 23, year: 2024, exam_type: 'Practice',
    question_text: "What is 'textiles' concerned with in Home Economics?",
    answer_text: "The study of fabrics, fibers, and their uses in clothing and household items.",
    option_a: 'Cooking methods', option_b: 'The study of fabrics and fibers', option_c: 'Household budgeting', option_d: 'Childcare practices', correct_option: 'B'
  },
  {
    subject_id: 23, year: 2024, exam_type: 'Practice',
    question_text: "Why is proper ventilation important in a home?",
    answer_text: "To ensure fresh air circulation and reduce moisture, odors, and indoor pollutants.",
    option_a: 'It has no real benefit', option_b: 'To ensure fresh air circulation and reduce pollutants', option_c: 'Only for decoration', option_d: 'To increase electricity bills', correct_option: 'B'
  },
  {
    subject_id: 24, year: 2024, exam_type: 'Practice',
    question_text: "What event marked the start of British colonial rule in the Gold Coast?",
    answer_text: "The declaration of the Gold Coast as a British colony in 1874, following earlier trade and military involvement.",
    option_a: 'The 1957 independence', option_b: 'The declaration as a British colony in 1874', option_c: 'The founding of the UN', option_d: 'World War II', correct_option: 'B'
  },
  {
    subject_id: 24, year: 2024, exam_type: 'Practice',
    question_text: "Who led the 'Big Six' in Ghana's independence movement?",
    answer_text: "The Big Six included Kwame Nkrumah, J.B. Danquah, and four others who were key figures in the independence struggle.",
    option_a: 'A group of British colonial officers', option_b: 'Key Ghanaian independence movement figures', option_c: 'A foreign trade delegation', option_d: 'A group of chiefs only', correct_option: 'B'
  },
  {
    subject_id: 24, year: 2024, exam_type: 'Practice',
    question_text: "What was the significance of the 1948 Accra riots?",
    answer_text: "They highlighted growing discontent with colonial rule and accelerated the push for independence.",
    option_a: 'They had no historical significance', option_b: 'They highlighted discontent and accelerated independence efforts', option_c: 'They ended all colonial trade', option_d: 'They were purely economic events', correct_option: 'B'
  },
  {
    subject_id: 25, year: 2024, exam_type: 'Practice',
    question_text: "What is 'irony' in literature?",
    answer_text: "A contrast between expectation and reality, often used for dramatic or comedic effect.",
    option_a: 'A type of rhyme', option_b: 'A contrast between expectation and reality', option_c: 'The setting of a story', option_d: 'A character\'s name', correct_option: 'B'
  },
  {
    subject_id: 25, year: 2024, exam_type: 'Practice',
    question_text: "What is a 'soliloquy', commonly found in plays?",
    answer_text: "A speech in which a character reveals their inner thoughts, typically alone on stage.",
    option_a: 'A dialogue between two characters', option_b: 'A speech revealing a character\'s inner thoughts, alone', option_c: 'The play\'s title', option_d: 'A stage direction', correct_option: 'B'
  },
  {
    subject_id: 25, year: 2024, exam_type: 'Practice',
    question_text: "What is 'characterization' in a novel?",
    answer_text: "The process by which an author develops and reveals a character's personality and traits.",
    option_a: 'The book\'s cover design', option_b: 'The process of developing a character\'s personality', option_c: 'The number of chapters', option_d: 'The publisher\'s name', correct_option: 'B'
  },
];

async function run() {
  for (const item of items) {
    try {
      const res = await fetch(`${API_URL}${ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY,
        },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      console.log('Added:', data.title || data.career_title || data.question_text || data.error);
    } catch (err) {
      console.error('Failed:', err.message);
    }
  }
  console.log('Done!');
}

run();