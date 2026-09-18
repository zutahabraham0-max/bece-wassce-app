// Run with: node bulk-add.js
const API_URL = 'https://bece-wassce-backend.onrender.com';
const ADMIN_KEY = 'QWERTYUIOP1234567890';
const ENDPOINT = '/careers'; // change to '/questions' or '/materials' as needed

const items = [
  {
    subject_id: 7, program: 'General Science',
    career_title: 'Mechanical Engineer',
    description: 'Designs, develops, and tests mechanical devices and systems, requiring advanced mathematics and physics.'
  },
  {
    subject_id: 7, program: 'General Science',
    career_title: 'Architect',
    description: 'Designs buildings and structures, blending mathematics, creativity, and technical knowledge.'
  },
  {
    subject_id: 7, program: 'Business',
    career_title: 'Financial Analyst',
    description: 'Evaluates financial data to guide investment and business decisions.'
  },
  {
    subject_id: 8, program: 'General Arts',
    career_title: 'University Lecturer',
    description: 'Teaches and conducts research at the university level, requiring deep subject expertise and strong communication skills.'
  },
  {
    subject_id: 8, program: 'General Arts',
    career_title: 'Public Relations Specialist',
    description: 'Manages the public image and communication strategy of organizations or individuals.'
  },
  {
    subject_id: 8, program: 'General Arts',
    career_title: 'Content Writer',
    description: 'Creates written content for websites, marketing, and media, requiring strong command of language.'
  },
  {
    subject_id: 9, program: 'General Science',
    career_title: 'Biomedical Engineer',
    description: 'Combines engineering principles with medical sciences to design healthcare equipment and devices.'
  },
  {
    subject_id: 9, program: 'General Science',
    career_title: 'Environmental Scientist',
    description: 'Studies environmental problems and develops solutions to protect ecosystems and public health.'
  },
  {
    subject_id: 9, program: 'General Science',
    career_title: 'Petroleum Engineer',
    description: 'Designs methods for extracting oil and gas, applying advanced physics and chemistry knowledge.'
  },
  {
    subject_id: 10, program: 'General Arts / Business',
    career_title: 'Economist',
    description: 'Studies how societies use resources, advising governments and businesses on economic policy.'
  },
  {
    subject_id: 10, program: 'General Arts / Business',
    career_title: 'Policy Analyst',
    description: 'Researches and evaluates public policies to advise governments and organizations.'
  },
  {
    subject_id: 10, program: 'General Arts / Business',
    career_title: 'Urban Planner',
    description: 'Designs land use and development plans for cities and communities, balancing social and economic factors.'
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
      console.log('Added:', data.career_title || data.title || data.question_text || data.error);
    } catch (err) {
      console.error('Failed:', err.message);
    }
  }
  console.log('Done!');
}

run();