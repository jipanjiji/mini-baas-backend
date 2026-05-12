const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const s3Client = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file ke Cloudflare R2
 * @param {Buffer} fileBuffer - Buffer dari file yang akan diupload
 * @param {string} originalFilename - Nama file asli (untuk mengambil ekstensi)
 * @param {string} mimetype - MIME type file
 * @returns {Promise<string>} Public URL dari file yang diupload
 */
async function uploadFile(fileBuffer, originalFilename, mimetype) {
  const extension = path.extname(originalFilename);
  const generatedFilename = `${uuidv4()}${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: generatedFilename,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    throw new Error(`Gagal mengupload file ke R2: ${error.message}`);
  }

  return `${process.env.R2_PUBLIC_URL}/${generatedFilename}`;
}

module.exports = { uploadFile };
