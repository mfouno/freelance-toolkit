const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/GEMINI_API_KEY=(.+)/);
  if (match) {
    const key = match[1].trim();
    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
      .then(r => r.json())
      .then(data => {
        if (data.models) {
          console.log(data.models.map(m => m.name).filter(n => n.includes('gemini')));
        } else {
          console.log(data);
        }
      })
      .catch(console.error);
  }
} catch (e) {
  console.error(e);
}
