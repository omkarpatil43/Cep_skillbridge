import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-pro',
    'gemini-3.6-flash',
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: 'Hello, respond with OK.' }] }],
      });
      console.log(`✅ Model ${modelName} SUCCESS:`, response.text?.trim());
    } catch (err: any) {
      console.log(`❌ Model ${modelName} FAILED:`, err.status || err.code || err.message);
    }
  }
}

testModels();
