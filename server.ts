import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mandari.db");
const JWT_SECRET = process.env.JWT_SECRET || "mandari-secret-key-123";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('artist', 'admin')) NOT NULL DEFAULT 'artist',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    artist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    tags TEXT,
    file_path TEXT NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default users
const seedUsers = () => {
  const adminEmail = "admin@mandari.com";
  const artistEmail = "artist@mandari.com";
  
  const adminExists = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)").run(uuidv4(), adminEmail, hashedPassword, "admin");
  }

  const artistExists = db.prepare("SELECT id FROM users WHERE email = ?").get(artistEmail);
  if (!artistExists) {
    const hashedPassword = bcrypt.hashSync("artist123", 10);
    db.prepare("INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)").run(uuidv4(), artistEmail, hashedPassword, "artist");
  }
};
seedUsers();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp3"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only MP3 and WAV are allowed."));
    }
  },
});

export async function createServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use("/uploads", express.static("uploads"));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    const userRole = role === "admin" ? "admin" : "artist"; // Simple role assignment for demo

    try {
      db.prepare("INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)").run(id, email, hashedPassword, userRole);
      res.status(201).json({ message: "User registered successfully" });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user.id, email: user.email, role: user.role } });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Admin Routes
  app.get("/api/admin/users", authenticate, isAdmin, (req, res) => {
    const users = db.prepare("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC").all();
    res.json(users);
  });

  app.delete("/api/admin/users/:id", authenticate, isAdmin, (req, res) => {
    const { id } = req.params;
    if (id === (req as any).user.id) return res.status(400).json({ error: "Cannot delete yourself" });
    
    // Delete user's songs first
    const songs: any = db.prepare("SELECT file_path FROM songs WHERE artist_id = ?").all(id);
    songs.forEach((song: any) => {
      const fullPath = path.join(__dirname, song.file_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });
    db.prepare("DELETE FROM songs WHERE artist_id = ?").run(id);
    
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ message: "User and their songs deleted" });
  });

  // Songs
  app.post("/api/songs/upload", authenticate, upload.single("file"), (req: any, res) => {
    const { title, description, genre, tags } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File required" });

    const id = uuidv4();
    const artistId = req.user.id;
    const filePath = `/uploads/${file.filename}`;

    db.prepare("INSERT INTO songs (id, artist_id, title, description, genre, tags, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, artistId, title, description, genre, tags, filePath);

    res.status(201).json({ id, title, filePath });
  });

  app.get("/api/songs", authenticate, (req: any, res) => {
    const { search, genre } = req.query;
    let query = "SELECT songs.*, users.email as artist_email FROM songs JOIN users ON songs.artist_id = users.id";
    const params: any[] = [];

    if (req.user.role !== "admin") {
      query += " WHERE artist_id = ?";
      params.push(req.user.id);
    } else {
      query += " WHERE 1=1";
    }

    if (search) {
      query += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (genre) {
      query += " AND genre = ?";
      params.push(genre);
    }

    query += " ORDER BY upload_date DESC";
    const songs = db.prepare(query).all(...params);
    res.json(songs);
  });

  app.delete("/api/songs/:id", authenticate, (req: any, res) => {
    const { id } = req.params;
    const song: any = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);
    
    if (!song) return res.status(404).json({ error: "Song not found" });
    if (req.user.role !== "admin" && song.artist_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete file
    const fullPath = path.join(__dirname, song.file_path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    db.prepare("DELETE FROM songs WHERE id = ?").run(id);
    res.json({ message: "Song deleted" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  return app;
}

// For local development
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  createServer().then(app => {
    app.listen(3000, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:3000`);
    });
  });
}

export default createServer;
