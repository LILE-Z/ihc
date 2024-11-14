require('dotenv').config(); // Cargar las variables de entorno desde .env

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;
app.use(express.json());
// Inicializa el cliente de Gemini
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


// Variable temporal para almacenar el prompt
let tempPrompt = "";

// Ruta para recibir el prompt desde input.html
app.post('/setPrompt', (req, res) => {
    tempPrompt = req.body.prompt || "Hello, Gemini!";
    res.sendStatus(200); // Respuesta exitosa sin redirección
});


// Ruta para interactuar con la API de Gemini
app.get('/generate', async (req, res) => {
    try {
        console.log(tempPrompt)
        const response = await model.generateContent(tempPrompt);
        
        console.log(response.response.text());
        res.send(response.response.text());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar texto con Gemini' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
app.use(express.static('public'));

