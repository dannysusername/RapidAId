import type { Schema } from '../../data/resource';
import { GoogleGenerativeAI } from '@google/generative-ai';

const VALID_CATEGORIES = ['medical', 'food', 'shelter', 'water', 'other'];

/**
 * AppSync resolver for the `categorizeRequest` mutation. Takes the free-text aid
 * request, asks Gemini for ALL matching categories, and returns a validated
 * `string[]`. Falls back to `['other']` on any failure so the submit flow never
 * hard-fails on the AI step.
 */
export const handler: Schema['categorizeRequest']['functionHandler'] = async (event) => {
  const { name, location, requestText } = event.arguments;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not configured — returning fallback category');
    return ['other'];
  }

  const prompt = `
Please categorize this aid request into one of these categories: medical, food, shelter, water, other

Request Details:
- Name: ${name || 'Anonymous'}
- Location: ${location}
- Request: ${requestText}

Based on the request text, respond with ALL matching categories as a comma-seperated list (medical, food, shelter, water, or other) in lowercase. No other text.
  `.trim();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim().toLowerCase();

    const categories = raw
      .split(',')
      .map((c) => c.trim())
      .filter((c) => VALID_CATEGORIES.includes(c));

    return categories.length > 0 ? categories : ['other'];
  } catch (error) {
    console.error('❌ Gemini categorization failed:', error);
    return ['other'];
  }
};
