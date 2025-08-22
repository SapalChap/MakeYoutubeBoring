// API Keys and sensitive configuration

const secrets = {
    SUPABASE_URL: 'yoursupabaseURL',
    SUPABASE_KEY: 'yourAPIkey',
    TABLE_NAME: 'yoursupabasetablename'
};


// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = secrets;
} else if (typeof window !== 'undefined') {
    // For browser environment
    window.secrets = secrets;
    console.log('Secrets added to window object');
}
