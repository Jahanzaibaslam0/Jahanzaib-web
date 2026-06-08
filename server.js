const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOADS_DIR = path.join(ROOT, "uploads");
const DB_FILE = path.join(DATA_DIR, "media.json");
const CONTACT_FILE = path.join(DATA_DIR, "contact-submissions.json");
const INQUIRY_FILE = path.join(DATA_DIR, "inquiry-submissions.json");
const CATEGORIES = ["Cow", "Buffalo", "Goat", "Sheep", "Horse", "General"];

function ensurePaths() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "[]", "utf-8");
  }
  if (!fs.existsSync(CONTACT_FILE)) {
    fs.writeFileSync(CONTACT_FILE, "[]", "utf-8");
  }
  if (!fs.existsSync(INQUIRY_FILE)) {
    fs.writeFileSync(INQUIRY_FILE, "[]", "utf-8");
  }
}

function safeCategory(value) {
  const found = CATEGORIES.find((c) => c.toLowerCase() === String(value || "").toLowerCase());
  return found || "General";
}

function mediaFolder(type) {
  return type === "video" ? "videos" : "images";
}

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeDb(items) {
  fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2), "utf-8");
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

ensurePaths();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = String(req.body.type || "image");
    const category = safeCategory(req.body.category);
    const folder = path.join(UPLOADS_DIR, category, mediaFolder(type));
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const type = String(req.body.type || "");
    if (type === "image" && file.mimetype.startsWith("image/")) return cb(null, true);
    if (type === "video" && file.mimetype.startsWith("video/")) return cb(null, true);
    cb(new Error("Invalid file type for selected media type."));
  },
});

app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));
app.use(express.static(ROOT));

app.get("/api/media", (req, res) => {
  const type = String(req.query.type || "");
  const category = String(req.query.category || "All");
  const limit = Number(req.query.limit || 0);

  let items = readDb();
  if (type) items = items.filter((x) => x.type === type);
  if (category !== "All") items = items.filter((x) => x.category === category);
  items = items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (limit > 0) items = items.slice(0, limit);
  res.json(items);
});

app.post("/api/media", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required." });
  }

  const type = String(req.body.type || "");
  const title = String(req.body.title || "").trim();
  const category = safeCategory(req.body.category);
  if (!title || (type !== "image" && type !== "video")) {
    return res.status(400).json({ error: "Invalid payload." });
  }

  const relativePath = path.relative(ROOT, req.file.path).split(path.sep).join("/");
  const item = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    category,
    mimeType: req.file.mimetype,
    filePath: relativePath,
    url: `/${relativePath}`,
    createdAt: new Date().toISOString(),
  };

  const items = readDb();
  items.push(item);
  writeDb(items);
  res.status(201).json(item);
});

app.delete("/api/media/:id", (req, res) => {
  const id = req.params.id;
  const items = readDb();
  const existing = items.find((x) => x.id === id);
  if (!existing) {
    return res.status(404).json({ error: "Not found." });
  }

  const next = items.filter((x) => x.id !== id);
  writeDb(next);

  const abs = path.join(ROOT, existing.filePath || "");
  if (fs.existsSync(abs)) {
    fs.unlinkSync(abs);
  }
  res.json({ ok: true });
});

app.get("/api/contact-submissions", (_req, res) => {
  const items = readJsonFile(CONTACT_FILE).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json(items);
});

app.post("/api/contact-submissions", (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();
  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: "All contact fields are required." });
  }

  const items = readJsonFile(CONTACT_FILE);
  const item = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    phone,
    email,
    message,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  writeJsonFile(CONTACT_FILE, items);
  res.status(201).json(item);
});

app.get("/api/inquiry-submissions", (_req, res) => {
  const items = readJsonFile(INQUIRY_FILE).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json(items);
});

app.post("/api/inquiry-submissions", (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const interest = String(req.body.interest || "").trim();
  const budget = String(req.body.budget || "").trim();
  const message = String(req.body.message || "").trim();
  if (!name || !phone || !interest || !message) {
    return res.status(400).json({ error: "Name, phone, interest and message are required." });
  }

  const items = readJsonFile(INQUIRY_FILE);
  const item = {
    id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    phone,
    interest,
    budget: budget || "N/A",
    message,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  writeJsonFile(INQUIRY_FILE, items);
  res.status(201).json(item);
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || "Request failed." });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

const port = Number(process.env.PORT || 5501);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
