import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';
const PORT = 3000;

// Initialize SQLite Database
const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    is_daily BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    user_id INTEGER,
    completed_date TEXT
  );
  CREATE TABLE IF NOT EXISTS streaks (
    user_id INTEGER PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date TEXT
  );
`);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ detail: 'Invalid token' });
  }
};

// API Routes
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ detail: 'Email and password required' });
  
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    const info = stmt.run(email, hashedPassword);
    
    // Initialize streak for new user
    db.prepare('INSERT INTO streaks (user_id) VALUES (?)').run(info.lastInsertRowid);
    
    res.json({ message: 'User created successfully' });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ detail: 'Email already exists' });
    }
    res.status(500).json({ detail: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  // Handle both JSON and form-urlencoded (from api.ts)
  const email = req.body.email || req.body.username;
  const password = req.body.password;
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ detail: 'Invalid email or password' });
  }
  
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ access_token: token, token_type: 'bearer' });
});

app.get('/api/tasks', authenticate, (req: any, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.userId);
  res.json(tasks);
});

app.post('/api/tasks', authenticate, (req: any, res) => {
  const { title, is_daily } = req.body;
  const stmt = db.prepare('INSERT INTO tasks (user_id, title, is_daily) VALUES (?, ?, ?)');
  const info = stmt.run(req.user.userId, title, is_daily ? 1 : 0);
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.json(newTask);
});

app.delete('/api/tasks/:id', authenticate, (req: any, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
  res.json({ success: true });
});

app.post('/api/tasks/:id/complete', authenticate, (req: any, res) => {
  const taskId = req.params.id;
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];
  
  // Check if task exists and belongs to user
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId);
  if (!task) return res.status(404).json({ detail: 'Task not found' });
  
  // Check if already completed today
  const existing = db.prepare('SELECT * FROM completions WHERE task_id = ? AND completed_date = ?').get(taskId, today);
  if (existing) return res.status(400).json({ detail: 'Task already completed today' });
  
  // Record completion
  db.prepare('INSERT INTO completions (task_id, user_id, completed_date) VALUES (?, ?, ?)').run(taskId, userId, today);
  
  // Update streak
  const streak = db.prepare('SELECT * FROM streaks WHERE user_id = ?').get(userId) as any;
  if (streak) {
    let { current_streak, longest_streak, last_completed_date } = streak;
    
    if (last_completed_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (last_completed_date === yesterdayStr) {
        current_streak += 1;
      } else {
        current_streak = 1;
      }
      
      if (current_streak > longest_streak) {
        longest_streak = current_streak;
      }
      
      db.prepare('UPDATE streaks SET current_streak = ?, longest_streak = ?, last_completed_date = ? WHERE user_id = ?')
        .run(current_streak, longest_streak, today, userId);
    }
  }
  
  res.json({ success: true });
});

app.get('/api/streak', authenticate, (req: any, res) => {
  let streak = db.prepare('SELECT * FROM streaks WHERE user_id = ?').get(req.user.userId) as any;
  if (!streak) {
    db.prepare('INSERT INTO streaks (user_id) VALUES (?)').run(req.user.userId);
    streak = { current_streak: 0, longest_streak: 0, last_completed_date: null };
  }
  res.json(streak);
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
