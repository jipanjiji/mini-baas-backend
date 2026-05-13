const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memvalidasi JWT token admin.
 * Mengecek header Authorization: Bearer <token>
 * Jika valid, lanjutkan ke handler berikutnya.
 */
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token tidak ditemukan'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token tidak valid atau sudah kadaluarsa'
    });
  }
}

module.exports = adminAuth;
