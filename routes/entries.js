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

    // Minimal salah satu harus ada (text atau gambar)
    if (!text_data && !req.file) {
      return res.status(400).json({
        success: false,
        error: 'Minimal harus ada text_data atau file gambar'
      });
    }

    let image_url = null;
    if (req.file) {
      try {
        image_url = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          error: 'Gagal mengupload file ke R2'
        });
      }
    }

    const { data, error } = await supabase
      .from('entries')
      .insert({
        project_id: req.project_id,
        text_data: text_data || null,
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

// GET /:project_id - Mendapatkan semua entry untuk project
// Public project: tanpa auth. Private project: butuh x-api-key header.
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

    // Query project to check access_mode
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, api_key, access_mode')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        error: 'Project tidak ditemukan'
      });
    }

    // If private, require x-api-key header
    if (project.access_mode === 'private') {
      const apiKey = req.headers['x-api-key'];

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API Key diperlukan untuk mengakses project ini'
        });
      }

      if (apiKey !== project.api_key) {
        return res.status(401).json({
          success: false,
          error: 'API Key tidak valid'
        });
      }
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
