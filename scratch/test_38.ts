import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function test38() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: 'Respond with: Gemini 3.8 ready' }] }],
    });
    console.log('SUCCESS with gemini-3.8-flash:', res.text?.trim());
  } catch (err: any) {
    console.log('FAILED with gemini-3.8-flash:', err.message);
  }
}

test38();
