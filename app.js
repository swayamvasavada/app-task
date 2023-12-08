const path = require('path');
const express = require('express');
const session = require('express-session');
const sessionConfig = require('./config/sessions');
const todoList = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const db = require('./data/database');
const authMiddleware = require('./middleware/auth-middleware');

let port = 3000;

if (process.env.PORT) {
  port = process.env.PORT;
}

const mongodbSessionStore = sessionConfig.createSessionStore(session);
const app = express();

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)
app.use('/files', express.static('files')); // Serve user uploaded files to view templete

app.use(session(sessionConfig.createSessionConfig(mongodbSessionStore)));
app.use(authMiddleware);

app.use(authRoutes);
app.use(todoList);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});

db.connectToDatabase().then(function () {
  app.listen(port);
})