# Changelog

Semua perubahan penting pada proyek **DocaCMS** akan didokumentasikan di berkas ini.

Format berkas ini merujuk pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan menggunakan penomoran versi [Semantic Versioning](https://semver.org/lang/id/).

---

## [1.1.0] - 2026-06-16

### Ditambahkan

- **Database Caching (Fase 3.1)**: Mekanisme in-memory caching `dbCache` pada `server.ts` untuk melayani request GET/POST/PUT/DELETE instan tanpa I/O blocking.
- **File Watcher (Fase 3.1)**: Watcher otomatis `fs.watch` untuk memperbarui memori cache saat berkas `database.json` diubah dari luar secara dinamis, dilengkapi guard `isSavingInternal`.
- **Dialog Kustom (Fase 3.5)**: Komponen dialog kustom berbasis React `ConfirmDialog.tsx` and `InputDialog.tsx` untuk menggantikan native dialog browser (`window.confirm`, `window.prompt`).
- **Penyelarasan Desain (Fase 3.3 & 3.4)**: Penambahan warna tema `--color-coral-950` di `@theme` CSS, serta pembersihan warna non-standar (`coral-150` dan `coral-750`).
- **Aksesibilitas & Keyboard Navigation (Fase 4.2)**: "Skip to Content" keyboard bypass link, focus trap keyboard di dialog kustom, tombol toolbar dengan ARIA label, serta tag semantic HTML5 (`nav`, `aside`) dan ARIA roles.
- **SEO & Open Graph (Fase 4.1)**: Meta tags (robots, description) dan Open Graph (type, title, description) di `index.html` serta update judul dinamis `document.title` secara real-time.

### Diperbaiki

- **Font Loading (Fase 3.2)**: Menggunakan font **Poppins** sebagai primary sans font dan menghapus font sans yang tidak digunakan (`Plus Jakarta Sans`, `Outfit`).
- **Bug CSS (Fase 3.3)**: Memperbaiki kesalahan penulisan vanilla CSS `max-w` menjadi `max-width` pada `.doca-embed-container`.
- **Typo & Referensi TS2448**: Perbaikan temporal dead zone (TDZ) variabel `activeDoc` dan `activeTopic` di `App.tsx` dengan memosisikannya di awal component scope.
- **Dependency Clean up (Fase 3.6)**: Membersihkan duplikat `vite`, memindahkan dependency development ke `devDependencies`, serta memigrasikan skrip pembersihan ke cross-platform `rimraf dist`.

---

## [1.0.0] - 2026-06-16

### Ditambahkan

- **Middleware Proteksi API (Fase 1.1)**: Proteksi token JWT menggunakan middleware `authenticateToken` pada seluruh endpoint mutasi (POST, PUT, DELETE) di `server.ts`.
- **Sanitasi HTML (Fase 1.2)**: Integrasi sanitizer `dompurify` pada editor visual dan public reading canvas guna mencegah celah keamanan Cross-Site Scripting (XSS).
- **Rate Limiter & CORS Whitelist (Fase 1.3)**: Memasang pembatas request (max 5 request/menit) pada endpoint login serta CORS global dengan whitelist domain terkonfigurasi.
- **Force Change Password (Fase 1.4)**: Mengamankan admin bawaan dengan mewajibkan penggantian kata sandi default pada saat pertama kali login.
- **Pemisahan Tipe Data (Fase 2.1)**: Konsolidasi seluruh tipe data ke `src/shared/types.ts` yang diakses bersama oleh frontend dan backend.
- **Refactoring Arsitektur React (Fase 2.2 & 2.3)**: Memecah `App.tsx` dan `RichTextEditor.tsx` menjadi custom hooks (`useAuth`, `useTopics`, `useDocumentations`, `useAutoSave`, `useTableEditor`) dan modular subcomponents (`LoginModal`, `EditorToolbar`, `TableDialog`, `TableToolbar`).
- **React Error Boundary (Fase 2.4)**: Komponen penyelamat crash `<ErrorBoundary />` untuk menangani unhandled runtime errors secara elegan.
