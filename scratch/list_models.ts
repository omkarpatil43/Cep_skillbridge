import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const list = await ai.models.list();
    console.log('Available models:');
    for await (const m of list) {
      console.log(' -', m.name);
    }
  } catch (err: any) {
    console.error('Failed to list models:', err);
  }
}

listModels();
