import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function testGen() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  const ai = new GoogleGenAI({ apiKey });
  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-2.5-pro',
  ];

  for (const m of candidateModels) {
    try {
      console.log(`Testing ${m}...`);
      const res = await ai.models.generateContent({
        model: m,
        contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: OK' }] }],
      });
      console.log(` SUCCESS with ${m}:`, res.text?.trim());
      break; // Found working model!
    } catch (err: any) {
      console.log(` FAILED with ${m}:`, err.message || err);
    }
  }
}

testGen();
