// --- Global Variables (Provided by Canvas Environment) ---
// These are necessary for Firebase initialization and user identification.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
// --- End Global Variables ---

// --- ABSOLUTE URL CALCULATION FIX ---
// This resolves issues when the app runs inside an isolated iframe/blob environment.
// It ensures all API calls and link references are absolute paths to the Express server.
export const SERVER_ORIGIN = 'http://localhost:3000'

// The full URL endpoint for the API
export const API_BASE = `${SERVER_ORIGIN}/api/links`;

// The base path for short links and redirects
export const REDIRECT_BASE_PATH = '/';