# DocaCMS — Custom Documentation Builder

DocaCMS adalah sistem manajemen konten (CMS) mandiri modern yang dirancang khusus untuk membuat, mengelola, dan mempublikasikan dokumentasi teknis atau basis pengetahuan (knowledge base) secara elegan, dinamis, dan responsif.

Aplikasi ini memiliki arsitektur terpisah antara React (frontend) dan Node.js/Express (backend) yang terintegrasi secara modular, aman, dan memiliki performa tinggi.

---

## 🚀 Fitur Utama

- **Penyusunan Sidebar Interaktif**: Mengatur tata letak bab utama dan sub-bab secara instan dengan navigasi naik/turun dinamis yang langsung menyimpan urutan (`sort_order`) ke database.
- **Editor WYSIWYG Kaya Teks**: Editor HTML visual kustom untuk menulis materi dengan H2, H3, teks tebal, miring, kutipan, tabel interaktif (mendukung resize kolom), info-box kustom, serta penyisipan tautan dan gambar.
- **Optimalisasi Performa (Database Caching)**: Backend menggunakan in-memory cache untuk menyajikan data secara instan tanpa hambatan operasi file synchronous read (`fs.readFileSync`). Database disinkronkan ke disk (`database.json`) secara asinkron saat terjadi perubahan data.
- **Sinkronisasi Otomatis (File Watcher)**: Menggunakan watcher file `fs.watch` untuk mendeteksi modifikasi eksternal pada database dan memperbarui in-memory cache secara real-time.
- **Keamanan Kritis Terjamin**:
  - Middleware otentikasi JWT pada seluruh endpoint API mutasi data.
  - Rate limiting pada endpoint login guna mencegah brute-force.
  - Kewajiban mengganti sandi default saat pertama kali login.
- **Aksesibilitas Tinggi (A11y)**:
  - Dukungan bypass navigasi ("Skip to Content") untuk navigasi keyboard cepat.
  - Focus trap keyboard lengkap dan penutupan dengan tombol `Escape` pada dialog kustom.
  - Atribut ARIA (`role="toolbar"`, `role="textbox"`, `aria-label`, dll.) dan tag semantik HTML5 (`nav`, `aside`).
- **SEO & Open Graph Terintegrasi**: Sinkronisasi judul halaman dinamis (`document.title`) berdasarkan topik aktif serta tag metadata Open Graph untuk pembagian media sosial.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Lucide React (Icons), Tailwind CSS v4.
- **Backend**: Node.js, Express, JSON Web Token (JWT), BcryptJS, Express Rate Limit, Cors.
- **Perkakas**: TypeScript (linting & type check), Vite (bundling), Esbuild (backend compiler), TSX (runner), Rimraf (pembersih lintas platform).

---

## 📁 Struktur Folder Utama

```text
custom-documentation-builder/
├── docs/                      # Dokumentasi Proyek
│   └── API.md                 # Spesifikasi API Lengkap
├── src/                       # Source Code Frontend (React)
│   ├── components/            # Komponen React Modular
│   │   ├── editor/            # Komponen & Hooks Editor WYSIWYG
│   │   ├── LoginModal.tsx     # Modal Login
│   │   ├── ConfirmDialog.tsx  # Dialog Konfirmasi Kustom
│   │   └── InputDialog.tsx    # Dialog Input/Prompt Kustom
│   ├── hooks/                 # Logika Bisnis (Custom Hooks)
│   │   ├── useAuth.ts         # Hook Pengaturan Autentikasi
│   │   ├── useDocumentations.ts # Hook CRUD Proyek Dokumentasi
│   │   └── useTopics.ts       # Hook CRUD Bab dan Topik
│   ├── shared/                # Berbagi Kode (Types)
│   │   └── types.ts           # Definisi Tipe Data Bersama
│   ├── App.tsx                # Komponen Utama Aplikasi
│   └── main.tsx               # Entrypoint React
├── database.json              # File Database JSON (Disinkronkan)
├── server.ts                  # Backend Server Express (Node.js)
├── package.json               # Konfigurasi Dependensi & Skrip
└── index.html                 # Template HTML Utama
```

---

## ⚙️ Panduan Instalasi & Penggunaan

### Prasyarat

Pastikan Anda sudah menginstal **Node.js** (versi 18 ke atas disarankan) di komputer Anda.

### 1. Kloning & Instal Dependensi

Masuk ke direktori proyek dan instal seluruh pustaka yang diperlukan:

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Buat berkas `.env` di root direktori proyek (salin dari `.env.example`) dan tentukan kode rahasia JWT Anda:

```env
JWT_SECRET=rahasia_jwt_super_aman_anda
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Menjalankan di Mode Pengembangan (Development)

Menjalankan frontend dan server backend secara lokal untuk pengembangan:

```bash
npm run dev
```

Buka peramban Anda pada alamat `http://localhost:3000`.

### 4. Build & Jalankan di Mode Produksi (Production)

Lakukan kompilasi bundel kode untuk mode produksi, lalu jalankan server:

```bash
# Build frontend (Vite) dan server (Esbuild)
npm run build

# Menjalankan server hasil kompilasi
npm start
```

### 5. Skrip Utilitas Lainnya

```bash
# Melakukan type checking kode TypeScript
npm run lint

# Menghapus folder build produksi (dist)
npm run clean
```

---

## 📄 API & Lisensi

- Spesifikasi API lengkap dapat dibaca pada [docs/API.md](file:///d:/HTLM%20CSS%20Project/custom-documentation-builder/docs/API.md).
- Proyek ini dilisensikan di bawah [MIT License](file:///d:/HTLM%20CSS%20Project/custom-documentation-builder/LICENSE).
