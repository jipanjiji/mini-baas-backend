require('dotenv').config();

const validateEnv = require('./utils/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware - permissive for development (allow all origins)
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/entries', require('./routes/entries'));

// Health check route
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Mini BaaS API is running'
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  return res.status(500).json({
    success: false,
    error: 'Terjadi kesalahan pada server'
  });
});

// Untuk development lokal
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Mini BaaS Backend berjalan di port ${PORT}`);
  });
}

module.exports = app;
