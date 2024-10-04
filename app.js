const express = require('express');
const mongoose = require('mongoose');
const routeUser = require('./Routes/user')

mongoose.connect('mongodb+srv://benjaminbelfort:iitjigW7fMJsyiFc@cluster0.oun5a.mongodb.net/mydatabase?retryWrites=true&w=majority')
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

module.exports = app;