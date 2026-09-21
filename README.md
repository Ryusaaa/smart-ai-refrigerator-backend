# SmartAI Refrigerator — Backend

REST API untuk **SmartAI Refrigerator**: aplikasi kulkas pintar yang mencatat isi kulkas, memantau tanggal kedaluwarsa, dan memakai AI untuk membuat rekomendasi resep serta menjawab pertanyaan lewat chatbot.

> Repo pasangan: [frontend](../frontend) (React + Vite).

## Fitur

- **Autentikasi** – register, login, dan cek sesi (`/auth/me`) dengan JWT + bcrypt.
- **Manajemen bahan** – CRUD bahan makanan (kategori, jumlah, satuan, tanggal kedaluwarsa, gambar) dengan status kedaluwarsa otomatis (`EXPIRED`, `CRITICAL`, `SOON`, `SAFE`, `NO_EXPIRATION`).
- **Dashboard** – ringkasan total bahan, jumlah kategori, bahan yang segera kedaluwarsa, rincian per kategori, dan bahan yang baru ditambahkan.
- **Generator resep AI** – resep dibuat dari isi kulkas + preferensi (waktu masak, tingkat kesulitan). Keluaran AI divalidasi dengan JSON schema dan dicoba ulang hingga 3 kali bila format salah. Tiap resep diberi skor rekomendasi (kecocokan bahan 50%, urgensi kedaluwarsa 30%, preferensi 20%).
- **Chatbot AI** – percakapan tersimpan di database, mendukung streaming (Server-Sent Events), dan bisa menyisipkan kartu resep yang otomatis disimpan.
- **Pencarian gambar** – gambar bahan/resep dari Unsplash, Pexels, atau Google Custom Search (dengan gambar cadangan bila API key tidak diisi).
- **Integrasi perangkat** – endpoint untuk sinkronisasi inventaris dari perangkat keras/sensor/kamera.
- **Voice (kerangka)** – endpoint transkripsi dan chat suara sudah ada, tetapi provider STT/TTS belum diimplementasikan (mengembalikan `501`).

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Runtime | Node.js 18+ (ES Modules, `.mjs`) |
| Framework | Express 4 |
| Database | MySQL + Prisma ORM 5 |
| Auth | jsonwebtoken, bcryptjs |
| Validasi | express-validator |
| Upload | multer (memory storage) |
| AI | Cloudflare Workers AI (default `@cf/meta/llama-3.1-8b-instruct`) |

## Struktur Proyek

```
prisma/
  schema.prisma        # model: User, Ingredient, Recipe, RecipeIngredient,
                       #        RecipeSource, Conversation, Message
  migrations/
  seed.mjs             # data awal ±30 bahan
  scripts/             # skrip sekali jalan (backfill gambar)
src/
  index.mjs            # entry point
  app.mjs              # setup Express (cors, json, routes, error handler)
  config/              # env & Prisma client
  constants/           # enum (IngredientSource, MessageRole, ExpirationStatus)
  routes/              # definisi endpoint per modul
  controllers/         # handler request/response
  services/
    ai/                # provider Cloudflare, prompt builder, response parser
    image/             # pencarian gambar
    speech/            # STT/TTS (belum diimplementasikan)
    security/          # enkripsi AES-256-GCM untuk audio
    recommendation.service.mjs
    inventory.service.mjs
    chat.service.mjs
    auth.service.mjs
  repositories/        # akses data via Prisma
  middlewares/         # auth, validasi, error handler
  validators/          # skema validasi request
  utils/
```

## Prasyarat

- Node.js 18 atau lebih baru (memakai `fetch` bawaan)
- MySQL 8 (atau MariaDB yang kompatibel)
- Akun [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (Account ID + API Token)
- *(Opsional)* API key Unsplash / Pexels / Google Custom Search untuk gambar

## Instalasi

```bash
# 1. Install dependensi
npm install

# 2. Salin file environment lalu isi nilainya
cp .env.example .env

# 3. Buat database (contoh)
mysql -u root -e "CREATE DATABASE smartai_refrigerator;"

# 4. Jalankan migrasi & generate Prisma Client
npx prisma migrate deploy
npx prisma generate

# 5. (Opsional) isi data contoh
npm run db:seed

# 6. Jalankan server
npm run dev      # development (nodemon)
npm start        # production
```

Server berjalan di `http://localhost:5000`. Cek dengan `GET /api/health`.

## Konfigurasi Environment

Buat file `.env` di root proyek:

```env
PORT=5000
DATABASE_URL="mysql://root:@localhost:3306/smartai_refrigerator"

# Auth (wajib diganti di production)
JWT_SECRET=isi_dengan_string_acak_yang_panjang
JWT_EXPIRES_IN=7d

# Cloudflare Workers AI (wajib untuk chatbot & resep)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
CLOUDFLARE_AI_MAX_TOKENS=4096
CLOUDFLARE_AI_TEMPERATURE=0.4

# Pencarian gambar (opsional): unsplash | pexels | google
IMAGE_SEARCH_PROVIDER=unsplash
IMAGE_SEARCH_API_KEY=
IMAGE_SEARCH_ENGINE_ID=          # hanya untuk provider google

# Enkripsi audio, 32 byte dalam hex (64 karakter) — untuk fitur voice
AUDIO_ENCRYPTION_KEY=
```

Membuat kunci enkripsi:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Ringkasan API

Base URL: `http://localhost:5000/api`. Respons berbentuk `{ "success": true, "data": ... }`.

| Modul | Method & Path | Keterangan |
| --- | --- | --- |
| Health | `GET /health` | Cek status server |
| Auth | `POST /auth/register` | Daftar akun, mengembalikan token |
| | `POST /auth/login` | Login, mengembalikan token |
| | `GET /auth/me` 🔒 | Profil user dari token (`Authorization: Bearer <token>`) |
| Dashboard | `GET /dashboard` | Statistik & ringkasan kulkas |
| Bahan | `GET /ingredients` | Daftar bahan |
| | `GET /ingredients/:id` | Detail bahan |
| | `POST /ingredients` | Tambah bahan |
| | `PUT /ingredients/:id` | Ubah bahan |
| | `DELETE /ingredients/:id` | Hapus bahan |
| Resep | `POST /recipes/generate` | Buat resep dengan AI |
| | `GET /recipes` | Riwayat resep |
| | `GET /recipes/:id` | Detail resep |
| Chat | `POST /chat` | Kirim pesan (respons penuh) |
| | `GET /chat/stream?message=&conversationId=` | Kirim pesan (SSE: event `status`, `token`, `recipe_pending`, `recipe`) |
| | `GET /chat/conversations` | Daftar percakapan |
| | `GET /chat/conversations/:id` | Detail percakapan |
| | `DELETE /chat/conversations/:id` | Hapus percakapan |
| Voice | `POST /voice/transcribe` | Upload audio → teks *(STT belum tersedia)* |
| | `POST /voice/chat` | Audio → jawaban AI → audio *(STT/TTS belum tersedia)* |
| Device | `GET /device/status` | Status & sumber data yang didukung |
| | `POST /device/inventory` | Sinkronisasi bahan dari perangkat (`{ deviceId, items: [...] }`) |

🔒 = memerlukan token JWT.

### Contoh

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"rahasia123"}'

# Generate resep
curl -X POST http://localhost:5000/api/recipes/generate \
  -H "Content-Type: application/json" \
  -d '{"maxCookingTime":30,"difficulty":"easy"}'
```

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server dengan nodemon |
| `npm start` | Menjalankan server |
| `npm run db:seed` | Mengisi database dengan bahan contoh |
| `npx prisma studio` | Membuka GUI database |

## Catatan Pengembangan

- Sumber data bahan: `MANUAL`, `CAMERA`, `SENSOR`, `HARDWARE`, `AI_SCAN`.
- Provider AI dipisah di `src/services/ai/`, sehingga bisa diganti dengan menulis provider baru yang menggantikan `cloudflare.provider.mjs`.
- Implementasi STT/TTS cukup mengisi `stt.provider.mjs` dan `tts.provider.mjs`.
