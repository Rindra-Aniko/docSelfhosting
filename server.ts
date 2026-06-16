import dotenv from "dotenv";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { User, Documentation, Topic, Database } from "./src/shared/types";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("CRITICAL ERROR: JWT_SECRET environment variable is not defined!");
  process.exit(1);
}

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
if (process.env.APP_URL) {
  allowedOrigins.push(process.env.APP_URL);
}
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Types are imported from src/shared/types.ts

const DB_PATH = path.join(process.cwd(), "database.json");

let dbCache: Database | null = null;
let isSavingInternal = false;
let watcher: fs.FSWatcher | null = null;

function startWatchingDB() {
  if (watcher) return;
  if (!fs.existsSync(DB_PATH)) return;

  try {
    watcher = fs.watch(DB_PATH, (eventType) => {
      if (isSavingInternal) return;
      if (eventType === "change") {
        console.log("Database file modified externally. Reloading cache...");
        try {
          const raw = fs.readFileSync(DB_PATH, "utf-8");
          const data = JSON.parse(raw);
          if (
            data &&
            Array.isArray(data.users) &&
            Array.isArray(data.documentations) &&
            Array.isArray(data.topics)
          ) {
            dbCache = data;
          }
        } catch (err) {
          console.error("Error reloading database from watcher:", err);
        }
      }
    });
  } catch (watcherError) {
    console.error("Failed to initialize database file watcher:", watcherError);
  }
}

// Helper function to load DB
function loadDB(): Database {
  if (dbCache) {
    return dbCache;
  }
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultDB: Database = getSeededData();
      isSavingInternal = true;
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), "utf-8");
      setTimeout(() => {
        isSavingInternal = false;
      }, 100);
      dbCache = defaultDB;
      startWatchingDB();
      return defaultDB;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const data = JSON.parse(raw);
    let needsSave = false;
    // Ensure users array exists for older databases
    if (!data.users || data.users.length === 0) {
      const seeded = getSeededData();
      data.users = seeded.users;
      // Also ensure we have at least the default documentations if empty
      if (!data.documentations || data.documentations.length === 0) {
        data.documentations = seeded.documentations;
      }
      if (!data.topics || data.topics.length === 0) {
        data.topics = seeded.topics;
      }
      needsSave = true;
    }
    dbCache = data;
    startWatchingDB();
    if (needsSave) {
      saveDB(data);
    }
    return dbCache;
  } catch (error) {
    console.error("Error loading database, returning default seed", error);
    const seeded = getSeededData();
    dbCache = seeded;
    return dbCache;
  }
}

// Helper function to save DB
function saveDB(db: Database): void {
  try {
    dbCache = db;
    isSavingInternal = true;
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    // We use a short timeout before resetting the internal save flag
    // to allow any file watcher events triggered by this write to be ignored.
    setTimeout(() => {
      isSavingInternal = false;
    }, 100);
  } catch (err) {
    console.error("Failed to save database file on disk", err);
  }
}

// Default/Seeded Database structure matching user's sql schema
function getSeededData(): Database {
  const docId = "panduan-docacms";
  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: "admin-1",
      username: "admin",
      // default password is 'admin123'
      password_hash: bcrypt.hashSync("admin123", 10),
      created_at: now,
      must_change_password: true,
    },
  ];

  const documentations: Documentation[] = [
    {
      id: docId,
      title: "Panduan Pengenalan DocaCMS",
      description: "Panduan resmi untuk memahami konfigurasi, fitur, dan penulisan bab di DocaCMS.",
      created_at: now,
    },
    {
      id: "proyek-blank",
      title: "API References & SDK",
      description:
        "Basis pengetahuan teknis untuk integrasi API eksternal dan setup library pengembang.",
      created_at: now,
    },
  ];

  const topics: Topic[] = [
    {
      id: "bab-1",
      documentation_id: docId,
      title: "1. Pengenalan Umum",
      slug: "pengenalan-umum",
      parent_id: null,
      sort_order: 1,
      content:
        "<h2>Panduan Pengenalan Umum</h2><p>Selamat datang di Bab Utama pertama. Di sini kita akan mempelajari esensi dari pembuatan sistem dokumentasi yang baik.</p>",
      created_at: now,
    },
    {
      id: "sub-1-1",
      documentation_id: docId,
      title: "Apa itu DocaCMS?",
      slug: "apa-itu-docacms",
      parent_id: "bab-1",
      sort_order: 1,
      content: `<h2>Apa itu DocaCMS?</h2>
<p><strong>DocaCMS</strong> adalah sistem manajemen konten (CMS) mandiri yang dirancang khusus untuk mempublikasikan dokumentasi teknis dan basis pengetahuan secara elegan, responsif, dan terorganisir.</p>

<div class="my-4 p-4 rounded-lg bg-blue-50 text-blue-900 border-l-4 border-blue-500">
  <strong>📝 Info Penting:</strong> Aplikasi ini mendukung pembuatan nesting sidebar hingga dua tingkatan (Bab Utama & Sub-Bab) yang memiliki relasi berelasi-mandiri (Self-Referencing Relation).
</div>

<h3>Fitur-Fitur Utama Platform:</h3>
<ul>
  <li><strong>Penyusunan Sidebar Dinamis:</strong> Kelola struktur dokumentasi melalui antarmuka drag/interactive click dan ubah indeks urutan (sort_order).</li>
  <li><strong>Editor HTML Kaya Teks:</strong> Editor WYSIWYG yang ringan untuk membuat tulisan dengan tajuk h2, h3, teks tebal, miring, kutipan blockquote, tabel, kode, serta info-box.</li>
  <li><strong>Daftar Isi Otomatis:</strong> Navigasi cerdas di sebelah kanan yang otomatis mendeteksi elemen H2 dan H3 dalam tulisan Anda dan mendukung pindah porsi ketikan secara mulus.</li>
  <li><strong>Mode Publik (Baca Saja) & Editor:</strong> Sembunyikan panel admin dalam satu klik untuk mendapatkan tampilan membaca super bersih layaknya platform Stripe atau Tailwind.</li>
</ul>

<h3>Arsitektur Database SQL (Turso)</h3>
<p>Skema database dirancang dengan SQLite yang mendukung penyimpanan tabel mandiri:</p>
<pre><code>CREATE TABLE topics (
    id TEXT PRIMARY KEY,
    documentation_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    parent_id TEXT, -- Relasi Self-Referencing
    sort_order INTEGER DEFAULT 0,
    content TEXT, -- Teks HTML Murni
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);</code></pre>
<p>Setiap topik yang memiliki <code>parent_id = NULL</code> akan bertindak sebagai Bab Utama, sedangkan jika memiliki referensi <code>parent_id</code> ke topik lain, ia akan otomatis bersarang di bawah Bab Utama tersebut.</p>`,
      created_at: now,
    },
    {
      id: "sub-1-2",
      documentation_id: docId,
      title: "Mengelola Proyek Dokumentasi",
      slug: "mengelola-proyek-dokumentasi",
      parent_id: "bab-1",
      sort_order: 2,
      content: `<h2>Mulai Mengelola Dokumentasi Baru</h2>
<p>Untuk meluncurkan dokumentasi baru di DocaCMS, gunakan header navigasi di bagian atas halaman:</p>
<ol>
  <li>Klik tombol <strong>"Proyek baru"</strong> atau logo dropdown proyek.</li>
  <li>Masukkan judul dan deskripsi ringkas tentang dokumentasi yang ingin Anda kerjakan.</li>
  <li>Tekan tombol **Simpan**, dan Anda akan masuk ke lembar kerja yang bersih.</li>
</ol>
<div class="my-4 p-4 rounded-lg bg-amber-50 text-amber-900 border-l-4 border-amber-500">
  <strong>⚠️ Perhatian:</strong> Menghapus proyek dokumentasi utama akan secara otomatis menghapus seluruh daftar topik dan sub-bab yang berkaitan (Cascade Delete).
</div>`,
      created_at: now,
    },
    {
      id: "bab-2",
      documentation_id: docId,
      title: "2. Menulis & Mengatur Menu",
      slug: "menulis-mengatur-menu",
      parent_id: null,
      sort_order: 2,
      content:
        "<h2>Panduan Menulis & Menyortir Bab</h2><p>Gunakan bagian ini untuk memformat estetika tulisan Anda dengan format WYSIWYG yang canggih.</p>",
      created_at: now,
    },
    {
      id: "sub-2-1",
      documentation_id: docId,
      title: "Tips Menggunakan Editor",
      slug: "tips-menggunakan-editor",
      parent_id: "bab-2",
      sort_order: 1,
      content: `<h2>Tips Menggunakan Editor Kaya Teks</h2>
<p>Editor kami dirancang khusus untuk menghasilkan keluaran HTML murni yang kompetpatibel dengan berbagai peramban. Anda tidak perlu menguasai bahasa Markdown untuk menulis konten yang mengagumkan.</p>

<h3>Cara Menggunakan Format Elemen:</h3>
<p>Cukup pilih teks Anda atau letakkan kursor pada paragraf, kemudian klik salah satu alat tombol di toolbar editor:</p>
<ul>
  <li><strong>H2 & H3:</strong> Menentukan tajuk utama dan sub-tajuk. Format ini juga akan dideteksi oleh Sidebar Pemindai Halaman (On-This-Page Navigation).</li>
  <li><strong>Kotak Callout (Tip & Info):</strong> Membuat kotak informasi berlatar belakang warna untuk mengedepankan info krusial.</li>
  <li><strong>Blok Kode (Code Block):</strong> Format monospaced yang rapi untuk menyajikan cuplikan skrip pemrograman atau konfigurasi shell terminal.</li>
</ul>

<div class="my-4 p-4 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500">
  <strong>💡 Tip Desain:</strong> Untuk hasil baca yang optimal, selang-seling baris tulisan paragraf dengan heading yang berjarak seimbang untuk memberi ruang napas bagi mata pembaca.
</div>`,
      created_at: now,
    },
    {
      id: "sub-2-2",
      documentation_id: docId,
      title: "Pengaturan Urutan Sidebar",
      slug: "pengaturan-urutan-sidebar",
      parent_id: "bab-2",
      sort_order: 2,
      content: `<h2>Mengatur Urutan Menu Sidebar</h2>
<p>Secara bawaan, menu sidebar kiri diurutkan berdasarkan field <code>sort_order</code> terkecil hingga tertinggi.</p>
<h3>Langkah-Langkah Mengatur Urutan:</h3>
<ol>
  <li>Di Mode Editor, arahkan kursor ke dalam salah satu menu di sidebar kiri.</li>
  <li>Anda akan melihat panah ke atas (<strong>▲</strong>) dan kebawah (<strong>▼</strong>).</li>
  <li>Klik tombol panah tersebut untuk menaikkan atau menurunkan posisi materi di sidebar dengan instan tanpa harus mengetik form manual!</li>
</ol>
<p>Sistem akan segera mengirimkan request backend untuk memperbarui field <code>sort_order</code> secara otomatis dan memperbarui urutan tampilan bagi pembaca publik.</p>`,
      created_at: now,
    },
  ];

  return { users, documentations, topics };
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
    req.user = user;
    next();
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors(corsOptions));
  app.use(express.json());

  // AUTH API
  app.post("/api/auth/register", authenticateToken, async (req: any, res: any) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const db = loadDB();
    if (db.users.some((u) => u.username === username)) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser: User = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      username,
      password_hash: await bcrypt.hash(password, 10),
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDB(db);

    res.status(201).json({ message: "User registered successfully", userId: newUser.id });
  });

  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    const db = loadDB();
    const user = db.users.find((u) => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "24h",
    });
    const isDefaultAdmin = user.id === "admin-1" && user.must_change_password !== false;
    const mustChange = user.must_change_password === true || isDefaultAdmin;
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        must_change_password: mustChange,
      },
    });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password_hash, ...safeUser } = user;
    const isDefaultAdmin = user.id === "admin-1" && user.must_change_password !== false;
    const mustChange = user.must_change_password === true || isDefaultAdmin;
    res.json({
      ...safeUser,
      must_change_password: mustChange,
    });
  });

  app.put("/api/auth/profile", authenticateToken, (req: any, res) => {
    const { fullName, email, bio } = req.body;
    const db = loadDB();
    const idx = db.users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    db.users[idx] = {
      ...db.users[idx],
      fullName: fullName !== undefined ? fullName : db.users[idx].fullName,
      email: email !== undefined ? email : db.users[idx].email,
      bio: bio !== undefined ? bio : db.users[idx].bio,
    };

    saveDB(db);

    const { password_hash, ...safeUser } = db.users[idx];
    res.json({ message: "Profil berhasil diperbarui", user: safeUser });
  });

  app.put("/api/auth/change-password", authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Password saat ini dan password baru harus diisi" });
    }

    const db = loadDB();
    const idx = db.users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = db.users[idx];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Password saat ini salah" });
    }

    db.users[idx].password_hash = await bcrypt.hash(newPassword, 10);
    db.users[idx].must_change_password = false;
    saveDB(db);

    const { password_hash, ...safeUser } = db.users[idx];
    res.json({ message: "Password berhasil diperbarui", user: safeUser });
  });

  // API 1: Documentations CRUD
  app.get("/api/documentations", (req, res) => {
    const db = loadDB();
    res.json(db.documentations);
  });

  app.post("/api/documentations", authenticateToken, (req: any, res: any) => {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const db = loadDB();
    const newDoc: Documentation = {
      id:
        title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") +
        "-" +
        Date.now().toString().slice(-4),
      title,
      description: description || "",
      created_at: new Date().toISOString(),
    };
    db.documentations.push(newDoc);
    saveDB(db);
    res.status(201).json(newDoc);
  });

  app.put("/api/documentations/:id", authenticateToken, (req: any, res: any) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const db = loadDB();
    const docIndex = db.documentations.findIndex((d) => d.id === id);
    if (docIndex === -1) {
      return res.status(404).json({ error: "Documentation not found" });
    }
    db.documentations[docIndex] = {
      ...db.documentations[docIndex],
      title: title || db.documentations[docIndex].title,
      description:
        description !== undefined ? description : db.documentations[docIndex].description,
    };
    saveDB(db);
    res.json(db.documentations[docIndex]);
  });

  app.delete("/api/documentations/:id", authenticateToken, (req: any, res: any) => {
    const { id } = req.params;
    const db = loadDB();
    const filteredDocs = db.documentations.filter((d) => d.id !== id);
    if (filteredDocs.length === db.documentations.length) {
      return res.status(404).json({ error: "Documentation not found" });
    }
    db.documentations = filteredDocs;
    // Cascade delete topics under this documentation
    db.topics = db.topics.filter((t) => t.documentation_id !== id);
    saveDB(db);
    res.json({ message: "Documentation and all related topics successfully deleted" });
  });

  // API 2: Topics CRUD
  app.get("/api/documentations/:docId/topics", (req, res) => {
    const { docId } = req.params;
    const db = loadDB();
    const docTopics = db.topics
      .filter((t) => t.documentation_id === docId)
      .sort((a, b) => a.sort_order - b.sort_order);
    res.json(docTopics);
  });

  app.post("/api/topics", authenticateToken, (req: any, res: any) => {
    const { documentation_id, title, slug, parent_id, sort_order, content } = req.body;
    if (!documentation_id || !title || !slug) {
      return res.status(400).json({ error: "documentation_id, title, and slug are required" });
    }
    const db = loadDB();

    // Auto calculate sort_order if not provided
    let calculatedOrder = sort_order;
    if (calculatedOrder === undefined) {
      const existing = db.topics.filter(
        (t) => t.documentation_id === documentation_id && t.parent_id === (parent_id || null)
      );
      calculatedOrder =
        existing.length > 0 ? Math.max(...existing.map((t) => t.sort_order)) + 1 : 1;
    }

    const newTopic: Topic = {
      id: "topic-" + Math.random().toString(36).substr(2, 9),
      documentation_id,
      title,
      slug: slug
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      parent_id: parent_id || null,
      sort_order: calculatedOrder,
      content: content || "",
      created_at: new Date().toISOString(),
    };

    db.topics.push(newTopic);
    saveDB(db);
    res.status(201).json(newTopic);
  });

  app.put("/api/topics/:id", authenticateToken, (req: any, res: any) => {
    const { id } = req.params;
    const { title, slug, parent_id, sort_order, content } = req.body;
    const db = loadDB();
    const idx = db.topics.findIndex((t) => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Topic not found" });
    }

    db.topics[idx] = {
      ...db.topics[idx],
      title: title !== undefined ? title : db.topics[idx].title,
      slug:
        slug !== undefined
          ? slug
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          : db.topics[idx].slug,
      parent_id: parent_id !== undefined ? parent_id : db.topics[idx].parent_id,
      sort_order: sort_order !== undefined ? sort_order : db.topics[idx].sort_order,
      content: content !== undefined ? content : db.topics[idx].content,
    };

    saveDB(db);
    res.json(db.topics[idx]);
  });

  app.put("/api/topics-batch/reorder", authenticateToken, (req: any, res: any) => {
    const { topics } = req.body; // Array of { id: string, sort_order: number, parent_id: string|null }
    if (!Array.isArray(topics)) {
      return res.status(400).json({ error: "Topics array is required" });
    }

    const db = loadDB();
    topics.forEach((update: { id: string; sort_order: number; parent_id?: string | null }) => {
      const idx = db.topics.findIndex((t) => t.id === update.id);
      if (idx !== -1) {
        db.topics[idx].sort_order = update.sort_order;
        if (update.parent_id !== undefined) {
          db.topics[idx].parent_id = update.parent_id;
        }
      }
    });

    saveDB(db);
    res.json({ success: true, message: "Urutan topik berhasil diperbarui" });
  });

  app.delete("/api/topics/:id", authenticateToken, (req: any, res: any) => {
    const { id } = req.params;
    const db = loadDB();
    const hasTopic = db.topics.some((t) => t.id === id);
    if (!hasTopic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Cascade:
    // 1. Find children of this topic and turn them into root-level topics or delete them.
    // The spec says on delete cascade for topics: FOREIGN KEY (parent_id) REFERENCES topics(id) ON DELETE CASCADE
    // Yes! Let's do ON DELETE CASCADE. Recursively delete sub-topics.
    const idsToDelete = new Set<string>([id]);

    // Simple recursive search
    let oldSize = 0;
    while (idsToDelete.size > oldSize) {
      oldSize = idsToDelete.size;
      db.topics.forEach((t) => {
        if (t.parent_id && idsToDelete.has(t.parent_id)) {
          idsToDelete.add(t.id);
        }
      });
    }

    db.topics = db.topics.filter((t) => !idsToDelete.has(t.id));
    saveDB(db);
    res.json({
      message: "Topic and cascading sub-topics successfully deleted",
      deletedCount: idsToDelete.size,
    });
  });

  // Serve static files and handle SPA fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
