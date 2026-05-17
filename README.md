# 🔧 AutoService Pro - Система управления автосервисом

Полнофункциональная веб-система управления заказами автосервиса с аутентификацией по имени и паролю.

## ✨ Возможности

✅ **Аутентификация** - Безопасный вход/регистрация с хешированием паролей  
✅ **Доступ отовсюду** - Работает из любой точки мира через интернет  
✅ **Управление заказами** - Создание, редактирование, удаление заказов  
✅ **Отслеживание статуса** - Смена статуса заказа (новый → в работе → завершен)  
✅ **Статистика** - Информационная панель с метриками  
✅ **Красивый интерфейс** - Современный, адаптивный дизайн  
✅ **REST API** - Полный API для интеграции

---

## 🚀 Локальная установка (тестирование)

### 1. Установка Node.js
Скачайте с https://nodejs.org (LTS версия)

### 2. Подготовка проекта
```bash
# Распакуйте файлы в папку
cd autoservice-board

# Установите зависимости
npm install
```

### 3. Запуск сервера
```bash
npm start
```

Вы должны увидеть:
```
✅ Сервер запущен на http://localhost:3000
📝 Логин по умолчанию: admin / admin123
```

### 4. Открыть приложение
Откройте в браузере: **http://localhost:3000**

**Демо учетные данные:**
- Пользователь: `admin`
- Пароль: `admin123`

---

## 🌐 Развертывание в облаке (доступно из интернета)

### Вариант 1: Heroku (БЕСПЛАТНО)

#### Шаг 1: Создать аккаунт Heroku
1. Перейдите на https://www.heroku.com
2. Нажмите "Sign up" и создайте аккаунт
3. Установите Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

#### Шаг 2: Подготовить приложение
```bash
# Логин в Heroku
heroku login

# Создать приложение
heroku create your-autoservice-name

# Установить переменные окружения
heroku config:set JWT_SECRET=your-secret-key-here

# Развернуть
git push heroku main
```

**Приложение будет доступно:**
```
https://your-autoservice-name.herokuapp.com
```

### Вариант 2: Railway (РЕКОМЕНДУЕТСЯ)

#### Шаг 1: Создать проект
1. Перейдите на https://railway.app
2. Нажмите "Start a New Project"
3. Выберите "Deploy from GitHub"
4. Подключите GitHub репозиторий

#### Шаг 2: Добавить переменные окружения
В настройках проекта добавьте:
```
JWT_SECRET=your-secret-key-here
PORT=3000
```

#### Шаг 3: Развернуть
Railway автоматически развернет при каждом push

**Приложение будет доступно:**
```
https://your-project.up.railway.app
```

### Вариант 3: DigitalOcean App Platform

#### Шаг 1: Подготовить GitHub репозиторий
1. Создайте GitHub репозиторий
2. Загрузите туда файлы:
   - `server.js`
   - `index.html`
   - `package.json`

#### Шаг 2: Развернуть в DigitalOcean
1. Перейдите на https://cloud.digitalocean.com
2. Нажмите "Apps" → "Create App"
3. Выберите GitHub репозиторий
4. Настройте:
   - Port: 3000
   - Environment: NODE_ENV=production

#### Шаг 3: Развернуть
Нажмите "Deploy"

**Приложение будет доступно:**
```
https://your-app-name-xxx.ondigitalocean.app
```

---

## 🔐 Безопасность в продакшене

### 1. Смена пароля администратора
Отредактируйте `server.js` и измените пароль:
```javascript
// Строка ~20 - генерируем новый хеш пароля
// Используйте онлайн bcrypt генератор: https://bcrypt-generator.com
password: '$2a$10$NEW_HASH_HERE'
```

### 2. Смена JWT_SECRET
```bash
# Установите надежный секрет
export JWT_SECRET=super-secret-key-$(openssl rand -hex 32)
```

### 3. Использование реальной БД
Замените встроенную память на:
- **MongoDB** (облако: MongoDB Atlas)
- **PostgreSQL** (облако: Heroku Postgres, AWS RDS)
- **MySQL** (облако: AWS RDS, DigitalOcean)

Пример с MongoDB:
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
// ... использовать модели вместо массивов
```

### 4. HTTPS
Все облачные платформы автоматически выдают SSL сертификаты. Используйте HTTPS URL!

---

## 📱 Как использовать

### Вход в систему
1. Откройте приложение
2. Введите имя пользователя и пароль
3. Нажмите "Вход"

### Создание нового заказа
1. Заполните форму слева:
   - Имя клиента
   - Телефон
   - Модель автомобиля
   - Описание работ
2. Нажмите "➕ Добавить заказ"

### Управление заказом
- **✏️ Статус** - переключает статус (новый → в работе → завершен)
- **🗑️ Удалить** - удаляет заказ

### Регистрация нового пользователя
1. Нажмите "Новый аккаунт"
2. Заполните форму регистрации
3. Нажмите "Зарегистрироваться"

---

## 🔌 API Endpoints

### Аутентификация

**Вход**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Ответ:
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "fullname": "Администратор",
    "role": "admin"
  }
}
```

**Регистрация**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "mechanic1",
  "password": "password123",
  "fullname": "Иван Механик"
}
```

### Заказы

**Получить все заказы**
```bash
GET /api/jobs
Authorization: Bearer <token>
```

**Создать заказ**
```bash
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "client": "Иван Петров",
  "phone": "+7-900-123-4567",
  "car": "BMW 320i",
  "description": "Техническое обслуживание"
}
```

**Обновить заказ**
```bash
PUT /api/jobs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "в работе"
}
```

**Удалить заказ**
```bash
DELETE /api/jobs/:id
Authorization: Bearer <token>
```

---

## 🛠️ Решение проблем

### Ошибка: "Cannot find module 'express'"
```bash
npm install
```

### Ошибка: "EADDRINUSE: address already in use"
```bash
# Порт 3000 занят. Убейте процесс или используйте другой порт:
PORT=3001 npm start
```

### Приложение не загружается
1. Откройте консоль браузера (F12)
2. Проверьте вкладку "Console" на ошибки
3. Убедитесь, что сервер запущен

### Не работает авторизация
- Проверьте, что используете правильные учетные данные
- Очистите кэш браузера (Ctrl+Shift+Delete)
- Перезагрузитесь

---

## 📚 Расширение функциональности

### Добавить email уведомления
```javascript
const nodemailer = require('nodemailer');
// ... отправлять email при создании заказа
```

### Добавить SMS уведомления
```javascript
const twilio = require('twilio');
// ... отправлять SMS клиентам
```

### Интеграция с платежами
```javascript
const stripe = require('stripe');
// ... прием платежей через Stripe
```

### Экспорт в PDF/Excel
```javascript
const exceljs = require('exceljs');
const pdfkit = require('pdfkit');
// ... генерация отчетов
```

---

## 📞 Поддержка

Если возникли вопросы, проверьте:
1. Все ли файлы на месте (server.js, index.html, package.json)
2. Установлены ли зависимости (npm install)
3. Запущен ли сервер (npm start)
4. Правильный ли порт в браузере

---

## 📄 Лицензия

MIT - можно использовать свободно

---

**Создано для упрощения управления автосервисом** 🚗
