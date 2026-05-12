const supabase = require('../config/supabase.js');

/**
 * Middleware untuk memvalidasi header x-api-key.
 * Mengecek keberadaan header, lalu query tabel projects di Supabase.
 * Jika valid, attach project_id ke req object.
 */
async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API Key diperlukan'
    });
  }

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (error || !project) {
      return res.status(401).json({
        success: false,
        error: 'API Key tidak valid'
      });
    }

    req.project_id = project.id;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'API Key tidak valid'
    });
  }
}

module.exports = validateApiKey;
