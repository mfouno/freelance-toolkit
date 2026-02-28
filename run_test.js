const { GoogleGenerativeAI } = require('@google/generative-ai');

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  try {
    const r = await model.generateContent(["hello"]);
    console.log(r.response.text());
  } catch(e) {
    console.log(e.message);
  }
}
check();
