const crypto = require('crypto');
const supabase = require('../config/supabase');
const { Router } = require('express');

const router = Router();

// POST / - Membuat project baru
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nama project diperlukan'
      });
    }

    const api_key = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, api_key })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Gagal membuat project'
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        api_key: data.api_key,
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

// GET / - Mendapatkan daftar semua project
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Gagal mengambil daftar project'
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router;
