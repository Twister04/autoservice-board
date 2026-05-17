const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// === IN-MEMORY DATABASE ===
let users = [
  {
    id: 1,
    username: 'admin',
  password: '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy86qKm',
    fullname: 'Administrator',
    role: 'admin'
  }
];

let jobs = [];
let nextJobId = 1;
let nextUserId = 2;

// === HELPER FUNCTIONS ===
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// === API ROUTES ===

// Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, fullname } = req.body;

    if (!username || !password || !fullname) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: nextUserId++,
      username,
      password: hashedPassword,
      fullname,
      role: 'user'
    };

    users.push(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: { id: newUser.id, username: newUser.username, fullname: newUser.fullname, role: newUser.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, fullname: user.fullname, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Get all jobs
app.get('/api/jobs', authenticateToken, (req, res) => {
  res.json(jobs);
});

// Create job
app.post('/api/jobs', authenticateToken, (req, res) => {
  try {
    const { client, phone, car, description } = req.body;

    if (!client || !phone || !car || !description) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const newJob = {
      id: nextJobId++,
      client,
      phone,
      car,
      description,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    jobs.push(newJob);
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ error: 'Job creation failed' });
  }
});

// Update job
app.put('/api/jobs/:id', authenticateToken, (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = jobs.find(j => j.id === jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    Object.assign(job, req.body);
    res.json(job);
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({ error: 'Job update failed' });
  }
});

// Delete job
app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const index = jobs.findIndex(j => j.id === jobId);

    if (index === -1) {
      return res.status(404).json({ error: 'Job not found' });
    }

    jobs.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({ error: 'Job deletion failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Default login: admin / admin123`);
});
