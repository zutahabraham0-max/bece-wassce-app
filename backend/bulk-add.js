// Run with: node bulk-add.js
const API_URL = 'https://bece-wassce-backend.onrender.com';
const ADMIN_KEY = 'QWERTYUIOP1234567890';

const labelMap = {
  'General Science': 'Science Track',
  'Business': 'Business Track',
  'General Arts': 'Arts Track',
  'General Science / Business': 'Science / Business Track',
  'General Arts / Business': 'Arts / Business Track',
};

async function run() {
  const res = await fetch(`${API_URL}/careers`);
  const careers = await res.json();

  for (const c of careers) {
    const newProgram = labelMap[c.program] || c.program;
    if (newProgram === c.program) continue; // skip if no change needed

    try {
      const updateRes = await fetch(`${API_URL}/careers/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({
          program: newProgram,
          career_title: c.career_title,
          description: c.description,
        }),
      });
      const data = await updateRes.json();
      console.log(`Updated: ${data.career_title} -> ${data.program}`);
    } catch (err) {
      console.error('Failed:', c.career_title, err.message);
    }
  }
  console.log('Done!');
}

run();