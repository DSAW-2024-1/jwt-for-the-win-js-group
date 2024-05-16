const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cookieParser());

function createToken(payload) {
    return jwt.sign(payload, 'key_secret', { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, 'key_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.userData = decoded;
        next(); 
    });
}

const protectedRoutes = express.Router();
protectedRoutes.use(verifyToken);

protectedRoutes.get('/profile', (req, res) => {
    const profileInfo = {
        firstName: "Gaius",
        lastName: "Marcellus",
        email: "gaius.marcellus@example.com",
        birthDate: "1985-07-12"
    };
    res.status(200).json(profileInfo);
});

protectedRoutes.get('/contacts', (req, res) => {
    const contactsList = ['Gaius', 'Cornelia', 'Quintus', 'Livia', 'Tiberius', 'Octavia', 'Claudius', 'Valeria', 'Cicero', 'Antonia'];
    res.status(200).json(contactsList);
});

app.use(protectedRoutes); // Monta las rutas protegidas directamente en la raíz de la aplicación

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Credenciales recibidas:", email, password);
    if (email === 'admin@admin.com' && password === 'admin') {
        const token = createToken({ email });
        res.cookie('authToken', token, { httpOnly: true });
        res.status(200).json({ message: 'Inicio de sesión correcto' });
    } else {
        res.status(401).json({ error: 'Datos de sesión inválidos' });
    }
});

app.get('/', (req, res) => {
    res.send('<h2>Servidor funcionando en backend</h2>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`El servidor funcionando y escuchando en el puerto ${PORT}`);
});
