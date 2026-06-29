import { generateClient } from 'aws-amplify/data';

// One shared Amplify Data (AppSync) client for the whole app. Replaces the old
// Supabase client. `Amplify.configure()` runs first in main.jsx, so by the time
// any component imports this the client is ready to issue userPool-authed calls.
const client = generateClient();

export default client;
