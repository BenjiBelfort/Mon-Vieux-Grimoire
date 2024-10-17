const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const routeUser = require('./Routes/user')
const routeBook = require('./Routes/book')

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));
  

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Configuration de la route d'authentification
app.use('/api/auth', routeUser);

// Configuration de la route des livres
app.use('/api/books', routeBook);

app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;