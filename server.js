// Backend сервер для системы управления автосервисом
// Запуск: node server.js

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
   app.use(express.json());
   app.use(express.static(__dirname));
   app.use(express.static(path.join(__dirname)));

// Простая база данных (в продакшене используйте реальную БД)
let users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$YkOkWf2B8UFCBKLT9uXoLeyPgEyLkPaJWtFlzXRWMYC.48cFf2b9K', // password: admin123
    fullname: 'Администратор',
    role: 'admin'
  }
];

let jobs = [
  {
    id: 1,
    client: 'Иван Петров',
    phone: '+7-900-123-4567',
    car: 'BMW 320i',
    status: 'в работе',
    description: 'Техническое обслуживание',
    createdAt: new Date().toISOString()
  }
];

let nextJobId = 2;

// Вспомогательные функции
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
    return res.status(401).json({ error: 'Токен отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// API маршруты

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, fullname } = req.body;

    if (!username || !password || !fullname) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      fullname,
      role: 'user'
    };

    users.push(newUser);
    const token = generateToken(newUser);

    res.json({
      token,
      user: { id: newUser.id, username: newUser.username, fullname: newUser.fullname, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, fullname: user.fullname, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

// Получить текущего пользователя
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Получить все заказы
app.get('/api/jobs', authenticateToken, (req, res) => {
  res.json(jobs);
});

// Создать новый заказ
app.post('/api/jobs', authenticateToken, (req, res) => {
  try {
    const { client, phone, car, description } = req.body;

    if (!client || !phone || !car || !description) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const newJob = {
      id: nextJobId++,
      client,
      phone,
      car,
      description,
      status: 'новый',
      createdAt: new Date().toISOString()
    };

    jobs.push(newJob);
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

// Обновить заказ
app.put('/api/jobs/:id', authenticateToken, (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = jobs.find(j => j.id === jobId);

    if (!job) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    Object.assign(job, req.body);
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении заказа' });
  }
});

// Удалить заказ
app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const index = jobs.findIndex(j => j.id === jobId);

    if (index === -1) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    jobs.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении заказа' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`📝 Логин по умолчанию: admin / admin123`);
});
