import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { getDb } from './src/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'social-sync-secret-key';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static('public/uploads'));

  const db = await getDb();

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- AUTH ROUTES ---
  app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, fullName } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.run(
        'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, fullName]
      );
      res.json({ message: 'User registered successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been banned' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, isAdmin: false }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, username: user.username, fullName: user.full_name, profilePic: user.profile_pic } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', authenticate, async (req: any, res) => {
    const user = await db.get('SELECT id, username, email, full_name, profile_pic, cover_photo, age, gender, location, relationship_status, hobbies, is_verified FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
  });

  // --- USER ROUTES ---
  app.get('/api/users/:id', async (req, res) => {
    const user = await db.get('SELECT id, username, full_name, profile_pic, cover_photo, age, gender, location, relationship_status, hobbies, is_verified FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const followers = await db.get('SELECT COUNT(*) as count FROM followers WHERE following_id = ?', [user.id]);
    const following = await db.get('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?', [user.id]);
    
    res.json({ ...user, followersCount: followers.count, followingCount: following.count });
  });

  app.put('/api/users/profile', authenticate, upload.fields([{ name: 'profilePic' }, { name: 'coverPhoto' }]), async (req: any, res) => {
    const { fullName, age, gender, location, relationshipStatus, hobbies } = req.body;
    const files = req.files as any;
    
    let profilePicPath = undefined;
    let coverPhotoPath = undefined;

    if (files['profilePic']) profilePicPath = `/uploads/${files['profilePic'][0].filename}`;
    if (files['coverPhoto']) coverPhotoPath = `/uploads/${files['coverPhoto'][0].filename}`;

    const query = `
      UPDATE users 
      SET full_name = ?, age = ?, gender = ?, location = ?, relationship_status = ?, hobbies = ?
      ${profilePicPath ? ', profile_pic = ?' : ''}
      ${coverPhotoPath ? ', cover_photo = ?' : ''}
      WHERE id = ?
    `;
    
    const params = [fullName, age, gender, location, relationshipStatus, hobbies];
    if (profilePicPath) params.push(profilePicPath);
    if (coverPhotoPath) params.push(coverPhotoPath);
    params.push(req.user.id);

    await db.run(query, params);
    res.json({ message: 'Profile updated' });
  });

  // --- POST ROUTES ---
  app.post('/api/posts', authenticate, upload.single('image'), async (req: any, res) => {
    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    await db.run('INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)', [req.user.id, content, imageUrl]);
    res.json({ message: 'Post created' });
  });

  app.get('/api/posts', authenticate, async (req: any, res) => {
    // Feed: posts from followed users + latest
    const posts = await db.all(`
      SELECT p.*, u.username, u.full_name, u.profile_pic, u.is_verified,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount,
      (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as isLiked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json(posts);
  });

  app.post('/api/posts/:id/like', authenticate, async (req: any, res) => {
    try {
      await db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [req.params.id, req.user.id]);
      res.json({ message: 'Liked' });
    } catch (err) {
      await db.run('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [req.params.id, req.user.id]);
      res.json({ message: 'Unliked' });
    }
  });

  app.post('/api/posts/:id/comments', authenticate, async (req: any, res) => {
    const { content } = req.body;
    await db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [req.params.id, req.user.id, content]);
    res.json({ message: 'Comment added' });
  });

  app.get('/api/posts/:id/comments', async (req, res) => {
    const comments = await db.all(`
      SELECT c.*, u.username, u.profile_pic 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.post_id = ? 
      ORDER BY c.created_at ASC
    `, [req.params.id]);
    res.json(comments);
  });

  // --- FOLLOW ROUTES ---
  app.post('/api/users/:id/follow', authenticate, async (req: any, res) => {
    if (req.user.id == req.params.id) return res.status(400).json({ error: 'Cannot follow yourself' });
    try {
      await db.run('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)', [req.user.id, req.params.id]);
      res.json({ message: 'Followed' });
    } catch (err) {
      await db.run('DELETE FROM followers WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
      res.json({ message: 'Unfollowed' });
    }
  });

  // --- ADMIN ROUTES ---
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    // For demo, hardcoded admin or check admins table
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign({ username, isAdmin: true }, JWT_SECRET);
      res.cookie('adminToken', token, { httpOnly: true, secure: true, sameSite: 'none' });
      return res.json({ message: 'Admin logged in' });
    }
    res.status(401).json({ error: 'Invalid admin credentials' });
  });

  const authenticateAdmin = (req: any, res: any, next: any) => {
    const token = req.cookies.adminToken;
    if (!token) return res.status(401).json({ error: 'Admin Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!(decoded as any).isAdmin) throw new Error();
      req.admin = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid admin token' });
    }
  };

  app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    const totalPosts = await db.get('SELECT COUNT(*) as count FROM posts');
    const totalComments = await db.get('SELECT COUNT(*) as count FROM comments');
    const totalLikes = await db.get('SELECT COUNT(*) as count FROM likes');
    const newUsersToday = await db.get("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')");
    
    res.json({
      totalUsers: totalUsers.count,
      totalPosts: totalPosts.count,
      totalComments: totalComments.count,
      totalLikes: totalLikes.count,
      newUsersToday: newUsersToday.count
    });
  });

  app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    const users = await db.all('SELECT id, username, email, full_name, is_verified, is_banned, created_at FROM users');
    res.json(users);
  });

  app.post('/api/admin/users/:id/verify', authenticateAdmin, async (req, res) => {
    await db.run('UPDATE users SET is_verified = NOT is_verified WHERE id = ?', [req.params.id]);
    res.json({ message: 'User verification toggled' });
  });

  app.post('/api/admin/users/:id/ban', authenticateAdmin, async (req, res) => {
    await db.run('UPDATE users SET is_banned = NOT is_banned WHERE id = ?', [req.params.id]);
    res.json({ message: 'User ban status toggled' });
  });

  app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
