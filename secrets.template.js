// Template for secrets.js - Copy this file to secrets.js and add your actual API keys
// This template file CAN be committed to version control as it contains no sensitive data

const secrets = {
    SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
    SUPABASE_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = secrets;
} else if (typeof window !== 'undefined') {
    // For browser environment
    window.secrets = secrets;
}
