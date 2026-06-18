import { GoogleGenerativeAI } from '@google/generative-ai';
import databaseService from './databaseService.js';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
      this.initialized = true;
      
      console.log('✅ Gemini service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Gemini service:', error.message);
      throw error;
    }
  }

  async categorizeRequest(requestData) {
    if (!this.initialized) {
      await this.initialize();
    }

    const { name, location, request_text } = requestData;
    
    // Create a structured prompt for categorization
    const prompt = `
Please categorize this aid request into one of these categories: medical, food, shelter, water, other

Request Details:
- Name: ${name || 'Anonymous'}
- Location: ${location}
- Request: ${request_text}

Based on the request text, respond with ALL matching categories as a comma-seperated list (medical, food, shelter, water, or other) in lowercase. No other text.
    `.trim();

    try {
      console.log('🤖 Sending request to Gemini for categorization...');
      console.log('📝 Request prompt:', prompt);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const raw = response.text().trim().toLowerCase();

      // Validate the category
      const validCategories = ['medical', 'food', 'shelter', 'water', 'other'];
      const finalCategories = raw.split(',').map(c => c.trim()).filter(c => validCategories.includes(c));

      if (finalCategories.length === 0) {            // safety net: AI returned nothing valid
          finalCategories.push('other');
      }

      const processedRequest = {
        name: name || 'Anonymous',
        location: location,
        request_text: request_text,
        categories: finalCategories,
        status: 'unclaimed'
      };

      // Log the results to terminal for testing
      console.log('📊 Request Processing Results:');
      console.log('================================');
      console.log(`Name: ${processedRequest.name}`);
      console.log(`Location: ${processedRequest.location}`);
      console.log(`Request: ${processedRequest.request_text}`);
      console.log(`🏷️ AI Categories: ${processedRequest.categories.join(', ')}`);
      console.log(`Status: ${processedRequest.status}`);
      console.log('================================');

      // Save to database; the saved row carries the DB-generated id + timestamps.
      try {
        const saved = await databaseService.addRequest(processedRequest);
        console.log(`💾 Request saved to database successfully (id: ${saved.id})`);
        return saved;
      } catch (dbError) {
        console.error('❌ Failed to save request to database:', dbError);
        // Still return what we processed so the UI can show a confirmation.
        return processedRequest;
      }
      
    } catch (error) {
      console.error('❌ Error during Gemini categorization:', error);
      
      // Fallback to 'other' category if API fails
      const fallbackRequest = {
        name: name || 'Anonymous',
        location: location,
        request_text: request_text,
        categories: ['other'],
        status: 'unclaimed'
      };

      console.log('📊 Fallback Request Processing Results:');
      console.log('================================');
      console.log(`Name: ${fallbackRequest.name}`);
      console.log(`Location: ${fallbackRequest.location}`);
      console.log(`Request: ${fallbackRequest.request_text}`);
      console.log(`🏷️ Fallback Categories: ${fallbackRequest.categories.join(', ')}`);
      console.log(`Status: ${fallbackRequest.status}`);
      console.log('❌ Error: AI categorization failed, using fallback category');
      console.log('================================');

      // Still save fallback request to database
      try {
        await databaseService.addRequest(fallbackRequest);
        console.log('💾 Fallback request saved to database');
      } catch (dbError) {
        console.error('❌ Failed to save fallback request to database:', dbError);
      }

      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }
}

// Create and export a singleton instance
const geminiService = new GeminiService();
export default geminiService;
