const { Router } = require('express');
const jwt = require('jsonwebtoken');

const router = Router();

// POST /api/auth/login - Login admin
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username dan password diperlukan'
      });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecret = process.env.ADMIN_SECRET;

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        error: 'Username atau password salah'
      });
    }

    const token = jwt.sign(
      { username: adminUsername, role: 'admin' },
      adminSecret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router;
