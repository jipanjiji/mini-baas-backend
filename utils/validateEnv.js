/**
 * Validates that all required environment variables are set.
 * Throws an error with the names of missing variables if any are not defined.
 */
function validateEnv() {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL',
  ];

  const missing = requiredVars.filter(
    (varName) => !process.env[varName] || process.env[varName].trim() === ''
  );

  if (missing.length > 0) {
    throw new Error(
      `Environment variables berikut belum di-set: ${missing.join(', ')}`
    );
  }
}

module.exports = validateEnv;
