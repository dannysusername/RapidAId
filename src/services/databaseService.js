// Database service backed by Supabase (shared Postgres DB).
// Method names are kept identical to the old IndexedDB version so the rest
// of the app (components, geminiService) does not need to change.
import supabase from './supabaseClient.js';

// Columns that actually exist on the `requests` table. addRequest() whitelists
// against this so stray fields (e.g. a generated `id` or an `error` flag) never
// reach the insert and break it.
const REQUEST_COLUMNS = [
  'name',
  'location',
  'request_text',
  'categories',
  'status',
  'priority',
  'latitude',
  'longitude',
  'contact_info',
  'is_anonymous',
  'org_id',
  'claimed_by_org',
];

class DatabaseService {
  // Kept for API compatibility — Supabase needs no per-browser setup.
  async initialize() {
    return true;
  }

  // Add a new request. The DB generates `id`, `created_at`, and `updated_at`.
  async addRequest(requestData) {
    // Whitelist only real columns so a client-generated id / error field is dropped.
    const insertData = {};
    for (const key of REQUEST_COLUMNS) {
      if (requestData[key] !== undefined) {
        insertData[key] = requestData[key];
      }
    }

    const { data, error } = await supabase
      .from('requests')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to add request:', error.message);
      throw error;
    }

    console.log(`✅ Added request ${data.id} to database`);
    return data;
  }

  // Get all requests, newest first.
  async getAllRequests() {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to get requests:', error.message);
      throw error;
    }

    console.log(`📋 Retrieved ${data.length} requests from database`);
    return data;
  }

  // Get requests that include a given category (categories is an array column).
  async getRequestsByCategory(category) {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .contains('categories', [category])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  // Get requests by status.
  async getRequestsByStatus(status) {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  // Update a request's status.
  async updateRequestStatus(id, status) {
    const { data, error } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to update request ${id}:`, error.message);
      throw error;
    }

    console.log(`✅ Updated request ${id} status to ${status}`);
    return data;
  }

  // Delete a single request.
  async deleteRequest(id) {
    const { error } = await supabase.from('requests').delete().eq('id', id);

    if (error) {
      console.error('❌ Failed to delete request:', error.message);
      throw error;
    }

    console.log(`✅ Deleted request ${id} from database`);
  }

  // Clear all requests (dev/testing). The `not null` filter matches every row.
  async clearAllRequests() {
    const { error } = await supabase
      .from('requests')
      .delete()
      .not('id', 'is', null);

    if (error) {
      console.error('❌ Failed to clear requests:', error.message);
      throw error;
    }

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

  // Migrate any legacy 'pending' status to 'unclaimed' for consistency.
  async migratePendingToUnclaimed() {
    const { data, error } = await supabase
      .from('requests')
      .update({ status: 'unclaimed', updated_at: new Date().toISOString() })
      .eq('status', 'pending')
      .select('id');

    if (error) {
      console.error('❌ Failed to migrate pending requests:', error.message);
      throw error;
    }

    const updatedCount = data?.length ?? 0;
    if (updatedCount > 0) {
      console.log(`✅ Migrated ${updatedCount} pending requests to unclaimed status`);
    } else {
      console.log('✅ No pending requests found to migrate');
    }
    return updatedCount;
  }
}

// Create and export a singleton instance
const databaseService = new DatabaseService();
export default databaseService;
