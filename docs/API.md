# DocaCMS API Specifications

Semua endpoint API di DocaCMS mengembalikan data berformat JSON. Endpoint mutasi (POST, PUT, DELETE) dilindungi menggunakan token JWT yang dikirim lewat header HTTP Authorization.

---

## Ringkasan Endpoint

| Method     | Endpoint                            | Deskripsi                                 | Proteksi Auth | Rate Limited       |
| :--------- | :---------------------------------- | :---------------------------------------- | :------------ | :----------------- |
| **POST**   | `/api/auth/register`                | Mendaftarkan akun administrator baru      | **Ya** (JWT)  | Tidak              |
| **POST**   | `/api/auth/login`                   | Autentikasi masuk akun administrator      | Tidak         | **Ya** (5 req/min) |
| **GET**    | `/api/auth/me`                      | Mengambil detail profil user yang aktif   | **Ya** (JWT)  | Tidak              |
| **PUT**    | `/api/auth/profile`                 | Memperbarui detail nama, email, dan bio   | **Ya** (JWT)  | Tidak              |
| **PUT**    | `/api/auth/change-password`         | Mengganti password akun                   | **Ya** (JWT)  | Tidak              |
| **GET**    | `/api/documentations`               | Mendapatkan daftar proyek dokumentasi     | Tidak         | Tidak              |
| **POST**   | `/api/documentations`               | Membuat proyek dokumentasi baru           | **Ya** (JWT)  | Tidak              |
| **PUT**    | `/api/documentations/:id`           | Memperbarui judul & deskripsi proyek      | **Ya** (JWT)  | Tidak              |
| **DELETE** | `/api/documentations/:id`           | Menghapus proyek beserta seluruh bab      | **Ya** (JWT)  | Tidak              |
| **GET**    | `/api/documentations/:docId/topics` | Mendapatkan daftar topik suatu proyek     | Tidak         | Tidak              |
| **POST**   | `/api/topics`                       | Membuat bab utama atau sub-bab baru       | **Ya** (JWT)  | Tidak              |
| **PUT**    | `/api/topics/:id`                   | Memperbarui data bab (judul, konten, dll) | **Ya** (JWT)  | Tidak              |
| **PUT**    | `/api/topics-batch/reorder`         | Memperbarui urutan bab secara massal      | **Ya** (JWT)  | Tidak              |
| **DELETE** | `/api/topics/:id`                   | Menghapus bab beserta seluruh sub-bab     | **Ya** (JWT)  | Tidak              |

---

## Spesifikasi Detail

### 1. Autentikasi & Akun

#### POST `/api/auth/register`

- **Deskripsi**: Mendaftarkan administrator baru. Hanya admin yang sudah login yang diizinkan memanggil endpoint ini.
- **Header**: `Authorization: Bearer <token_jwt>`
- **Body Request**:
  ```json
  {
    "username": "admin_baru",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "userId": "user-abcdef123"
  }
  ```

#### POST `/api/auth/login`

- **Deskripsi**: Masuk sebagai admin untuk mendapatkan token akses. Dibatasi maksimal 5 percobaan per menit.
- **Body Request**:
  ```json
  {
    "username": "admin",
    "password": "adminpassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "admin-1",
      "username": "admin",
      "must_change_password": false
    }
  }
  ```

#### GET `/api/auth/me`

- **Deskripsi**: Mengambil profil data user aktif berdasarkan token JWT.
- **Header**: `Authorization: Bearer <token_jwt>`
- **Response (200 OK)**:
  ```json
  {
    "id": "admin-1",
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@myinfo.my.id",
    "bio": "DocaCMS Administrator",
    "created_at": "2026-06-16T04:20:13Z",
    "must_change_password": false
  }
  ```

#### PUT `/api/auth/change-password`

- **Deskripsi**: Mengganti kata sandi. Otomatis menghapus status paksa ganti password (`must_change_password`).
- **Header**: `Authorization: Bearer <token_jwt>`
- **Body Request**:
  ```json
  {
    "currentPassword": "admin123",
    "newPassword": "newsecurepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Password berhasil diperbarui",
    "user": {
      "id": "admin-1",
      "username": "admin",
      "must_change_password": false
    }
  }
  ```

---

### 2. Proyek Dokumentasi

#### GET `/api/documentations`

- **Deskripsi**: Membaca seluruh daftar proyek dokumentasi (terbuka untuk publik).
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "panduan-docacms-1234",
      "title": "Panduan Pengenalan DocaCMS",
      "description": "Panduan resmi konfigurasi bab di DocaCMS.",
      "created_at": "2026-06-16T04:20:13Z"
    }
  ]
  ```

#### DELETE `/api/documentations/:id`

- **Deskripsi**: Menghapus proyek dokumentasi secara permanen. Menghapus proyek ini secara otomatis akan menghapus seluruh topik dan sub-bab di dalamnya (_Cascade Delete_).
- **Header**: `Authorization: Bearer <token_jwt>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Documentation and all related topics successfully deleted"
  }
  ```

---

### 3. Topik & Bab Dokumentasi

#### GET `/api/documentations/:docId/topics`

- **Deskripsi**: Mengambil seluruh bab & sub-bab dari suatu proyek dokumentasi terurut berdasarkan properti `sort_order`.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "bab-1",
      "documentation_id": "panduan-docacms",
      "title": "1. Pengenalan Umum",
      "slug": "pengenalan-umum",
      "parent_id": null,
      "sort_order": 1,
      "content": "<h2>Judul</h2><p>Konten HTML...</p>",
      "created_at": "2026-06-16T04:20:13Z"
    }
  ]
  ```

#### PUT `/api/topics-batch/reorder`

- **Deskripsi**: Memperbarui urutan (`sort_order`) dan relasi induk (`parent_id`) beberapa bab sekaligus saat di-drag atau di-klik naik/turun di sidebar.
- **Header**: `Authorization: Bearer <token_jwt>`
- **Body Request**:
  ```json
  {
    "topics": [
      { "id": "bab-1", "sort_order": 2, "parent_id": null },
      { "id": "sub-1-1", "sort_order": 1, "parent_id": "bab-1" }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Urutan topik berhasil diperbarui"
  }
  ```

#### DELETE `/api/topics/:id`

- **Deskripsi**: Menghapus bab secara permanen. Jika bab yang dihapus memiliki sub-bab, seluruh sub-bab tersebut akan ikut terhapus (_Cascade Delete_).
- **Header**: `Authorization: Bearer <token_jwt>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Topic and cascading sub-topics successfully deleted",
    "deletedCount": 3
  }
  ```
