// Database service backed by AWS Amplify Data (AppSync + DynamoDB).
// Method names and the returned object SHAPE are kept identical to the old
// Supabase/IndexedDB versions, so the rest of the app (components, geminiService)
// does not need to change. The only job here is translating between the app's
// snake_case shape (request_text, created_at) and the Amplify model's camelCase
// fields (requestText, createdAt).
import client from './amplifyClient.js';

// Fields the UI uses, mapped from app-shape -> Amplify model field name.
// Anything not listed (id, created_at, error flags, …) is server-managed or dropped.
const WRITABLE_FIELDS = {
  name: 'name',
  location: 'location',
  request_text: 'requestText',
  categories: 'categories',
  status: 'status',
  priority: 'priority',
  latitude: 'latitude',
  longitude: 'longitude',
  contact_info: 'contactInfo',
};

// Amplify model record -> the snake_case shape the components expect.
function toAppShape(record) {
  if (!record) return record;
  const { requestText, contactInfo, createdAt, updatedAt, ...rest } = record;
  return {
    ...rest,
    request_text: requestText,
    contact_info: contactInfo,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

// App-shape input -> Amplify model input (only whitelisted, defined fields).
function toModelInput(requestData) {
  const input = {};
  for (const [appKey, modelKey] of Object.entries(WRITABLE_FIELDS)) {
    if (requestData[appKey] !== undefined) {
      input[modelKey] = requestData[appKey];
    }
  }
  return input;
}

class DatabaseService {
  // Kept for API compatibility — Amplify needs no per-browser setup.
  async initialize() {
    return true;
  }

  // Add a new request. Amplify generates id, createdAt, and updatedAt.
  async addRequest(requestData) {
    const { data, errors } = await client.models.Request.create(toModelInput(requestData));

    if (errors) {
      console.error('❌ Failed to add request:', errors);
      throw new Error(errors.map((e) => e.message).join('; '));
    }

    console.log(`✅ Added request ${data.id} to database`);
    return toAppShape(data);
  }

  // Get all requests, newest first.
  async getAllRequests() {
    const { data, errors } = await client.models.Request.list();

    if (errors) {
      console.error('❌ Failed to get requests:', errors);
      throw new Error(errors.map((e) => e.message).join('; '));
    }

    const requests = data
      .map(toAppShape)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`📋 Retrieved ${requests.length} requests from database`);
    return requests;
  }

  // Get requests that include a given category (filtered client-side).
  async getRequestsByCategory(category) {
    const all = await this.getAllRequests();
    return all.filter((r) => r.categories?.includes(category));
  }

  // Get requests by status (filtered client-side).
  async getRequestsByStatus(status) {
    const all = await this.getAllRequests();
    return all.filter((r) => r.status === status);
  }

  // Update a request's status.
  async updateRequestStatus(id, status) {
    const { data, errors } = await client.models.Request.update({ id, status });

    if (errors) {
      console.error(`❌ Failed to update request ${id}:`, errors);
      throw new Error(errors.map((e) => e.message).join('; '));
    }

    console.log(`✅ Updated request ${id} status to ${status}`);
    return toAppShape(data);
  }

  // Delete a single request. Deletes are not granted in the schema authorization
  // rules, so this will fail server-side — kept only for API compatibility.
  async deleteRequest(id) {
    const { errors } = await client.models.Request.delete({ id });
    if (errors) {
      console.error('❌ Failed to delete request:', errors);
      throw new Error(errors.map((e) => e.message).join('; '));
    }
    console.log(`✅ Deleted request ${id} from database`);
  }

  // Clear all requests (dev/testing). Deletes are not authorized — best effort.
  async clearAllRequests() {
    const all = await this.getAllRequests();
    await Promise.all(all.map((r) => this.deleteRequest(r.id)));
    console.log('✅ Cleared all requests from database');
  }

  // Aggregate stats for the dashboard.
  async getStats() {
    const requests = await this.getAllRequests();

    const stats = {
      total: requests.length,
      byCategory: {},
      byStatus: {},
      recent: requests.slice(0, 5),
    };

    requests.forEach((request) => {
      request.categories?.forEach((category) => {
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });
      stats.byStatus[request.status] = (stats.byStatus[request.status] || 0) + 1;
    });

    return stats;
  }

  // Legacy 'pending' migration is a no-op now — DynamoDB starts fresh with the
  // 'unclaimed' status enum, so there is nothing to migrate.
  async migratePendingToUnclaimed() {
    return 0;
  }
}

// Create and export a singleton instance
const databaseService = new DatabaseService();
export default databaseService;
