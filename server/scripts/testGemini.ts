import dotenv from 'dotenv';
import { generateGeminiResponse } from '../services/geminiService.js';

dotenv.config();

const run = async () => {
  try {
    const answer = await generateGeminiResponse('Reply with exactly: Gemini connection successful', [], '');
    console.log('Gemini smoke test passed.');
    console.log(`Response length: ${answer.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Gemini error';
    console.error(`Gemini smoke test failed: ${message}`);
    process.exitCode = 1;
  }
};

void run();
