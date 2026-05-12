const { Router } = require('express');
const multer = require('multer');
const validateApiKey = require('../middleware/validateApiKey');
const upload = require('../middleware/upload');
const { uploadFile } = require('../services/r2');
const supabase = require('../config/supabase');

const router = Router();

// POST / - Membuat entry baru (REQUIRES x-api-key)
router.post('/', validateApiKey, upload, async (req, res) => {
  try {
    const { text_data } = req.body;

    if (!text_data) {
      return res.status(400).json({
        success: false,
        error: 'text_data diperlukan'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File gambar diperlukan'
      });
    }

    let image_url;
    try {
      image_url = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        error: 'Gagal mengupload file ke R2'
      });
    }

    const { data, error } = await supabase
      .from('entries')
      .insert({
        project_id: req.project_id,
        text_data,
        image_url
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Gagal menyimpan entry ke database'
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        id: data.id,
        project_id: data.project_id,
        text_data: data.text_data,
        image_url: data.image_url,
        created_at: data.created_at
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server'
    });
  }
});

// GET /:project_id - Mendapatkan semua entry untuk project (PUBLIC, no auth)
router.get('/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(project_id)) {
      return res.status(400).json({
        success: false,
        error: 'Format project_id tidak valid'
      });
    }

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil data entries'
      });
    }

    return res.status(200).json({
      success: true,
      data: data || []
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server'
    });
  }
});

// Multer error handler middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'Error upload file: ' + err.message
    });
  }

  if (err && err.message === 'Hanya file gambar yang diizinkan (jpeg, png, gif, webp)') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  next(err);
});

module.exports = router;
