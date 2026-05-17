const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Simple database
let users = [
  { id: 1, username: 'admin', password: 'admin123', fullname: 'Administrator', role: 'admin' }
];

let jobs = [];
let nextJobId = 1;
let nextUserId = 2;

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
  if (!token) return res.status(401).json({ error: 'Token missing' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Registration
app.post('/api/auth/register', (req, res) => {
  const { username, password, fullname } = req.body;
  if (!username || !password || !fullname) return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'User exists' });
  
  const newUser = { id: nextUserId++, username, password, fullname, role: 'user' };
  users.push(newUser);
  const token = generateToken(newUser);
  res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, fullname: newUser.fullname, role: newUser.role } });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Credentials required' });
  
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, fullname: user.fullname, role: user.role } });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/jobs', authenticateToken, (req, res) => {
  res.json(jobs);
});

app.post('/api/jobs', authenticateToken, (req, res) => {
  const { client, phone, car, description } = req.body;
  if (!client || !phone || !car || !description) return res.status(400).json({ error: 'All fields required' });
  
  const newJob = { id: nextJobId++, client, phone, car, description, status: 'new', createdAt: new Date().toISOString() };
  jobs.push(newJob);
  res.status(201).json(newJob);
});

app.put('/api/jobs/:id', authenticateToken, (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'Job not found' });
  Object.assign(job, req.body);
  res.json(job);
});

app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  const index = jobs.findIndex(j => j.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Job not found' });
  jobs.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📝 Login: admin / admin123`);
});
