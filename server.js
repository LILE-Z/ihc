require('dotenv').config(); // Cargar las variables de entorno desde .env

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // Usuario autenticado
  }
  res.redirect('/login'); // Redirige al login
}

// Middleware para servir archivos estáticos (CSS)
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/pages', express.static(path.join(__dirname, 'public/pages')));

// Middleware para servir archivos estáticos desde 'public'
app.use(express.static(path.join(__dirname, 'public')));


// Configuración de vistas (HBS)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ---- RUTAS ----

// Ruta para renderizar el formulario de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para manejar el login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).send('Error del servidor');
    }

    if (results.length === 0 || results[0].password !== password) {
      console.log('Error de login para el correo:', email);
      return res.render('error-login', { message: 'Correo o contraseña incorrectos.' });
    }

    console.log('Usuario autenticado:', results[0].email);
    req.session.user = results[0]; // Guarda al usuario en la sesión
    return res.redirect('/'); // Redirige al index
  });
});

// Ruta para la página principal (index.hbs)
app.get('/', isAuthenticated, (req, res) => {
  console.log('Usuario autenticado accedió a la página principal:', req.session.user.email);
  
  // Datos de ejemplo para las actividades con identificadores
  const activities = [
    { id: 1, title: 'Actividad 1', image: '/img/actividad1.webp' },
    { id: 2, title: 'Actividad 2', image: '/img/actividad2.jpg' },
    { id: 3, title: 'Actividad 3', image: '/img/actividad3.jpg' },
    { id: 4, title: 'Actividad 4', image: '/img/actividad4.webp' },
    { id: 5, title: 'Actividad 5', image: '/img/actividad5.webp' },
  ];

  // Renderiza la vista 'index' con las actividades
  res.render('index', { activities });
});






// Ruta para renderizar el formulario de recuperación
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

// Ruta para manejar el envío del correo electrónico
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).send('Error del servidor');
    }

    if (results.length === 0) {
      console.log('Correo no encontrado:', email);
      return res.render('error-forgot-password');
    }

    console.log('Correo encontrado:', email);
    res.redirect(`/reset-password?email=${encodeURIComponent(email)}`); // Redirige al formulario de restablecimiento
  });
});

// Ruta para mostrar el formulario de restablecimiento de contraseña
app.get('/reset-password', (req, res) => {
  const email = req.query.email; // Obtiene el correo de la query
  res.render('reset-password', { email }); // Pasa el correo al formulario
});

// Ruta para manejar el cambio de contraseña
app.post('/reset-password', (req, res) => {
  const { email, newPassword } = req.body;

  const query = 'UPDATE users SET password = ? WHERE email = ?';
  db.query(query, [newPassword, email], (err) => {
    if (err) {
      console.error('Error al actualizar la contraseña:', err);
      return res.status(500).send('Error al actualizar la contraseña');
    }

    console.log('Contraseña actualizada para:', email);
    res.redirect('/login'); // Redirige al login después de actualizar la contraseña
  });
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
