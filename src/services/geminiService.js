// Categorization service. The Gemini call now runs SERVER-SIDE in a Lambda
// (amplify/functions/categorize-request) behind the `categorizeRequest` GraphQL
// mutation — the API key never reaches the browser. This module just calls that
// mutation, then saves the result via databaseService, preserving the old
// contract (returns the saved DB row).
import client from './amplifyClient.js';
import databaseService from './databaseService.js';

class GeminiService {
  // Kept for API compatibility — no client-side init needed anymore.
  async initialize() {
    return true;
  }

  async categorizeRequest(requestData) {
    const { name, location, request_text } = requestData;

    let categories = ['other'];
    try {
      console.log('🤖 Asking the categorizeRequest Lambda (Gemini) to categorize...');
      const { data, errors } = await client.mutations.categorizeRequest({
        name: name || '',
        location,
        requestText: request_text,
      });

      if (errors) {
        throw new Error(errors.map((e) => e.message).join('; '));
      }
      if (Array.isArray(data) && data.length > 0) {
        categories = data.filter(Boolean);
      }
      console.log(`🏷️ AI Categories: ${categories.join(', ')}`);
    } catch (error) {
      console.error('❌ Categorization failed, using fallback category:', error);
      // categories stays ['other']; we still save the request below.
    }

    const processedRequest = {
      name: name || 'Anonymous',
      location,
      request_text,
      categories,
      status: 'unclaimed',
    };

    // Save to database; the saved row carries the DB-generated id + timestamps.
    const saved = await databaseService.addRequest(processedRequest);
    console.log(`💾 Request saved to database successfully (id: ${saved.id})`);
    return saved;
  }

  isInitialized() {
    return true;
  }
}

// Create and export a singleton instance
const geminiService = new GeminiService();
export default geminiService;
