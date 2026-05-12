# 🚀 Personal Mini BaaS

Backend as a Service (BaaS) pribadi yang bisa melayani banyak project frontend sekaligus. Setiap project punya API Key unik untuk mengirim data (teks + gambar) ke satu backend terpusat.

**Tech Stack:**
- Backend: Node.js + Express.js
- Frontend Dashboard: Nuxt.js (Vue 3) + TailwindCSS
- Database: Supabase (PostgreSQL)
- Storage: Cloudflare R2
- Hosting: Render.com

---

## 📋 Daftar Isi

1. [Setup Supabase](#-setup-supabase)
2. [Setup Cloudflare R2](#-setup-cloudflare-r2)
3. [Setup Render.com (Deployment)](#-setup-rendercom-deployment)
4. [Environment Variables](#-environment-variables)
5. [Cara Menjalankan Lokal](#-cara-menjalankan-lokal)
6. [API Endpoints](#-api-endpoints)
7. [Struktur Folder](#-struktur-folder)

---

## 🗄️ Setup Supabase

Supabase digunakan sebagai database PostgreSQL untuk menyimpan data project dan entry.

### Langkah-langkah:

1. **Buat akun Supabase**
   - Buka [https://supabase.com](https://supabase.com)
   - Klik "Start your project" dan daftar (bisa pakai GitHub)

2. **Buat project baru**
   - Setelah login, klik "New Project"
   - Isi nama project (bebas, misal "mini-baas")
   - Pilih region terdekat (misal Singapore)
   - Buat password database (simpan baik-baik!)
   - Klik "Create new project" dan tunggu sampai selesai

3. **Buat tabel di SQL Editor**
   - Di sidebar kiri, klik **SQL Editor**
   - Klik "New query"
   - Copy-paste SQL berikut, lalu klik **Run**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel entries
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text_data TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk mempercepat lookup
CREATE INDEX idx_projects_api_key ON projects(api_key);
CREATE INDEX idx_entries_project_id ON entries(project_id);
```

4. **Ambil credentials**
   - Pergi ke **Settings** (ikon gear di sidebar) → **API**
   - Catat dua nilai ini:
     - **Project URL** → ini jadi `SUPABASE_URL` kamu
     - **anon public key** (di bagian Project API keys) → ini jadi `SUPABASE_KEY` kamu

> 💡 **Tips:** Project URL formatnya seperti `https://abcdefgh.supabase.co`

---

## ☁️ Setup Cloudflare R2

Cloudflare R2 digunakan untuk menyimpan file gambar yang diupload.

### Langkah-langkah:

1. **Buat akun Cloudflare**
   - Buka [https://cloudflare.com](https://cloudflare.com)
   - Daftar akun baru (gratis)

2. **Buka R2 Object Storage**
   - Setelah login, di sidebar kiri klik **R2 Object Storage**
   - Kalau pertama kali, kamu mungkin perlu aktivasi R2 dulu (gratis untuk 10GB/bulan)

3. **Buat bucket baru**
   - Klik **Create bucket**
   - Beri nama bucket, misal: `mini-baas-storage`
   - Pilih region (Auto atau terdekat)
   - Klik **Create bucket**

4. **Aktifkan Public Access**
   - Masuk ke bucket yang baru dibuat
   - Pergi ke tab **Settings**
   - Cari bagian **Public Access**
   - Klik **Allow Access** atau **Enable**
   - Catat **Public URL** yang muncul (formatnya seperti `https://pub-xxxxx.r2.dev`)
   - URL ini jadi `R2_PUBLIC_URL` kamu

5. **Buat API Token**
   - Kembali ke halaman utama R2
   - Klik **Manage R2 API Tokens** (di sidebar atau pojok kanan)
   - Klik **Create API Token**
   - Beri nama token (misal "mini-baas-token")
   - Permissions: pilih **Object Read & Write**
   - Pilih bucket yang tadi dibuat
   - Klik **Create API Token**
   - **PENTING:** Catat semua credentials yang muncul:
     - **Access Key ID** → ini jadi `R2_ACCESS_KEY_ID`
     - **Secret Access Key** → ini jadi `R2_SECRET_ACCESS_KEY`

6. **Ambil Account ID**
   - Account ID bisa dilihat di URL browser saat kamu di dashboard Cloudflare
   - Formatnya: `https://dash.cloudflare.com/ACCOUNT_ID_KAMU/...`
   - Atau bisa dilihat di halaman overview R2
   - Ini jadi `R2_ACCOUNT_ID` kamu

> ⚠️ **Penting:** Simpan semua credentials dengan aman! Secret Access Key hanya ditampilkan sekali.

---

## 🌐 Setup Render.com (Deployment)

Render.com digunakan untuk deploy backend dan frontend ke internet.

### Deploy Backend:

1. **Buat akun Render**
   - Buka [https://render.com](https://render.com)
   - Daftar (bisa pakai GitHub)

2. **Buat Web Service baru**
   - Klik **New** → **Web Service**
   - Connect repository GitHub kamu
   - Pilih repo yang berisi project ini

3. **Konfigurasi service**
   - **Name:** mini-baas-backend (atau nama lain)
   - **Region:** Singapore atau terdekat
   - **Branch:** main
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Set Environment Variables**
   - Scroll ke bagian **Environment Variables**
   - Tambahkan semua variable berikut (lihat bagian [Environment Variables](#-environment-variables))
   - Klik **Create Web Service**

5. **Tunggu deployment selesai**
   - Render akan build dan deploy otomatis
   - Catat URL yang diberikan (misal `https://mini-baas-backend.onrender.com`)
   - URL ini yang dipakai frontend sebagai `NUXT_PUBLIC_API_URL`

### Deploy Frontend:

1. **Buat Web Service baru lagi**
   - Klik **New** → **Web Service**
   - Connect repo yang sama

2. **Konfigurasi:**
   - **Name:** mini-baas-frontend
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview` atau `node .output/server/index.mjs`

3. **Set Environment Variable:**
   - `NUXT_PUBLIC_API_URL` = URL backend dari langkah sebelumnya

4. Klik **Create Web Service** dan tunggu deployment selesai

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `PORT` | Port server backend | `3001` |
| `SUPABASE_URL` | URL project Supabase kamu | `https://abcdefgh.supabase.co` |
| `SUPABASE_KEY` | Anon/public key Supabase | `eyJhbGciOiJIUzI1NiIs...` |
| `R2_ACCOUNT_ID` | Account ID Cloudflare | `1a2b3c4d5e6f7g8h9i0j` |
| `R2_ACCESS_KEY_ID` | Access Key ID dari R2 API Token | `abcdef1234567890` |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key dari R2 API Token | `secret-key-kamu` |
| `R2_BUCKET_NAME` | Nama bucket R2 yang sudah dibuat | `mini-baas-storage` |
| `R2_PUBLIC_URL` | Public URL bucket R2 | `https://pub-xxxxx.r2.dev` |

### Frontend (`frontend/.env`)

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `NUXT_PUBLIC_API_URL` | URL backend API | `http://localhost:3001` (lokal) atau `https://mini-baas-backend.onrender.com` (production) |

---

## 💻 Cara Menjalankan Lokal

Pastikan kamu sudah punya [Node.js](https://nodejs.org/) (versi 18+) terinstall di komputer.

### Step by step:

```bash
# 1. Clone repo
git clone <repo-url>
cd <nama-folder>

# 2. Setup Backend
cd backend
npm install

# 3. Buat file .env dari template
cp .env.example .env

# 4. Edit file .env dengan credentials kamu
#    Buka file backend/.env dan isi semua variable
#    (lihat bagian Environment Variables di atas)

# 5. Jalankan backend server
npm run dev
# Server jalan di http://localhost:3001
```

Buka terminal baru untuk frontend:

```bash
# 6. Setup Frontend (terminal baru)
cd frontend
npm install

# 7. Buat file .env dari template
cp .env.example .env

# 8. Edit frontend/.env
#    Isi NUXT_PUBLIC_API_URL=http://localhost:3001

# 9. Jalankan frontend
npm run dev
# Dashboard buka di http://localhost:3000
```

> 💡 **Tips:** Pastikan backend sudah jalan dulu sebelum buka frontend, supaya API-nya bisa diakses.

---

## 📡 API Endpoints

### Daftar Endpoint

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/api/projects` | Tidak perlu | Membuat project baru |
| GET | `/api/projects` | Tidak perlu | Mendapatkan daftar semua project |
| POST | `/api/entries` | `x-api-key` | Membuat entry baru (teks + gambar) |
| GET | `/api/entries/:project_id` | Tidak perlu (publik) | Mendapatkan semua entry untuk project tertentu |

---

### POST /api/projects

Membuat project baru dan mendapatkan API Key.

**Request:**
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Project Website Sekolah"}'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Project Website Sekolah",
    "api_key": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error (400) - nama kosong:**
```json
{
  "success": false,
  "error": "Nama project diperlukan"
}
```

---

### GET /api/projects

Mendapatkan daftar semua project (urut dari terbaru).

**Request:**
```bash
curl http://localhost:3001/api/projects
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Project Website Sekolah",
      "api_key": "a1b2c3d4e5f6...",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Project App Kantin",
      "api_key": "x9y8z7w6v5u4...",
      "created_at": "2024-01-14T08:00:00.000Z"
    }
  ]
}
```

---

### POST /api/entries

Membuat entry baru (kirim teks + gambar). **Butuh API Key!**

**Request:**
```bash
curl -X POST http://localhost:3001/api/entries \
  -H "x-api-key: API_KEY_PROJECT_KAMU" \
  -F "text_data=Ini adalah data teks dari frontend" \
  -F "image=@/path/ke/gambar.jpg"
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "text_data": "Ini adalah data teks dari frontend",
    "image_url": "https://pub-xxxxx.r2.dev/a1b2c3d4-uuid-random.jpg",
    "created_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error (401) - API Key tidak ada:**
```json
{
  "success": false,
  "error": "API Key diperlukan"
}
```

**Error (401) - API Key salah:**
```json
{
  "success": false,
  "error": "API Key tidak valid"
}
```

**Error (400) - text_data kosong:**
```json
{
  "success": false,
  "error": "text_data diperlukan"
}
```

**Error (400) - gambar tidak ada:**
```json
{
  "success": false,
  "error": "File gambar diperlukan"
}
```

**Error (400) - tipe file tidak valid:**
```json
{
  "success": false,
  "error": "Hanya file gambar yang diizinkan (jpeg, png, gif, webp)"
}
```

---

### GET /api/entries/:project_id

Mendapatkan semua entry untuk project tertentu. **Endpoint ini publik (tidak perlu API Key).**

**Request:**
```bash
curl http://localhost:3001/api/entries/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "project_id": "550e8400-e29b-41d4-a716-446655440000",
      "text_data": "Ini adalah data teks dari frontend",
      "image_url": "https://pub-xxxxx.r2.dev/a1b2c3d4-uuid-random.jpg",
      "created_at": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

**Response (200) - project kosong / belum ada entry:**
```json
{
  "success": true,
  "data": []
}
```

**Error (400) - format project_id tidak valid:**
```json
{
  "success": false,
  "error": "Format project_id tidak valid"
}
```

---

## 📁 Struktur Folder

```
mini-baas/
├── backend/
│   ├── server.js              # Entry point, Express app setup
│   ├── config/
│   │   └── supabase.js        # Konfigurasi Supabase client
│   ├── middleware/
│   │   ├── validateApiKey.js  # Middleware validasi x-api-key
│   │   └── upload.js          # Konfigurasi Multer (file upload)
│   ├── routes/
│   │   ├── projects.js        # Route CRUD project
│   │   └── entries.js         # Route entry (create + read)
│   ├── services/
│   │   └── r2.js              # Service upload ke Cloudflare R2
│   ├── utils/
│   │   └── validateEnv.js     # Validasi environment variables
│   ├── package.json
│   ├── .env.example           # Template environment variables
│   └── README.md              # File ini!
│
└── frontend/
    ├── nuxt.config.ts         # Konfigurasi Nuxt.js
    ├── app.vue                # Root component
    ├── pages/
    │   └── index.vue          # Dashboard utama
    ├── components/
    │   ├── ProjectForm.vue    # Form buat project baru
    │   ├── ProjectList.vue    # Daftar project
    │   └── SimulationForm.vue # Form simulasi kirim data
    ├── composables/
    │   └── useApi.ts          # Helper untuk panggil API
    ├── tailwind.config.js     # Konfigurasi TailwindCSS
    ├── package.json
    └── .env.example           # Template env frontend
```

---

## ❓ FAQ

**Q: Kenapa GET /api/entries/:project_id tidak perlu API Key?**
A: Endpoint ini sengaja dibuat publik supaya frontend project (misal web CRUD) bisa menampilkan data tanpa perlu menyimpan API Key di client-side. Hanya operasi write (POST) yang butuh autentikasi.

**Q: Berapa ukuran maksimal file yang bisa diupload?**
A: Secara default tidak ada limit khusus dari Multer (selain memory), tapi Cloudflare R2 free tier mendukung file hingga 5GB per object.

**Q: Tipe file apa saja yang bisa diupload?**
A: Hanya file gambar: JPEG, PNG, GIF, dan WebP.

**Q: Bagaimana kalau lupa API Key?**
A: Buka dashboard frontend atau panggil GET /api/projects untuk melihat semua project beserta API Key-nya.

---

Dibuat dengan ❤️ untuk mempermudah development multi-project.
