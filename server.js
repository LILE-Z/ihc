require('dotenv').config(); // Cargar las variables de entorno desde .env

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express(); const PORT = 3000;
// Middleware para manejar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mi_secreto_seguro',
    resave: false,
    saveUninitialized: false,
  })
);

// Configurar conexión con MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'login_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos');
});
// Inicializa el cliente de Gemini
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // Usuario autenticado
  }
  res.redirect('/login'); // Redirige al login
}

// Middleware para proteger el directorio `public`
app.use('/public', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirige si no está autenticado
  }
  next();
});
app.use('/public', express.static(path.join(__dirname, 'public')));

// Configuración de vistas (login y register)
app.set('view engine', 'hbs');

// ---- SISTEMA DE LOGIN ----

// Ruta para renderizar el formulario de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para manejar el login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).send('Error del servidor');
    }

    if (results.length > 0) {
      console.log('Usuario autenticado:', results[0].email); // Log del usuario autenticado
      req.session.user = results[0]; // Guarda al usuario en la sesión
      return res.redirect('/'); // Redirige a la página principal
    } else {
      console.log('Intento de inicio de sesión fallido con el correo:', email); // Log del intento fallido
      return res.status(401).send('Correo o contraseña incorrectos');
    }
  });
});

// Ruta para servir la página principal (index.html)
app.get('/', isAuthenticated, (req, res) => {
  console.log('Usuario autenticado accedió a la página principal:', req.session.user.email); // Log del acceso a la página principal
  res.sendFile(path.join(__dirname, 'public/index.html')); // Asegúrate de que la ruta sea correcta
});

// Ruta para renderizar el formulario de registro
app.get('/register', (req, res) => {
  res.render('register');
});

// Ruta para manejar el registro
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(query, [name, email, password], (err) => {
    if (err) {
      console.error('Error al registrar el usuario:', err);
      return res.send('Error al registrar');
    }
    res.redirect('/login'); // Redirige al login después del registro
  });
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ---- FUNCIONALIDAD EXISTENTE ----

const contexto = "Simula ser un profesor de inglés amable y motivador que revisa y da retroalimentación constructiva a un estudiante según su desempeño en una actividad que realizó, ademas el publico es para ninos de primero de primaria, yo te proporcionare de que trata y el puntaje.Y recuerda usar Markdown y que el texto sea de almenos 1000 characters, ademas puedes usar emojis para hacerlo más amigable.";

// Variable temporal para almacenar el prompt
let tempPrompt = ' ';

// Ruta para recibir el prompt desde input.html
app.post('/setPrompt', (req, res) => {
  tempPrompt = contexto + req.body.prompt || 'Hello, Gemini!';
  res.sendStatus(200); // Respuesta exitosa sin redirección
});

// Ruta para interactuar con la API de Gemini
app.get('/generate', isAuthenticated, async (req, res) => {
  try {
    console.log(tempPrompt);
    const response = await model.generateContent(tempPrompt);

    console.log(response.response.text());
    res.send(response.response.text());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar texto con Gemini' });
  }
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

