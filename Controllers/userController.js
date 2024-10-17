const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');

// Charger les variables d'environnement
require('dotenv').config();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Inscription
exports.signup = (req, res, next) => {
    const { email, password } = req.body;

    // Validation de l'email et du mot de passe
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Adresse email invalide' });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre, et un caractère spécial' });
    }

    bcrypt.hash(password, 10)
      .then(hash => {
        const user = new User({
          email: email,
          password: hash
        });
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

// Connexion
exports.login = (req, res, next) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
            }

            bcrypt.compare(password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                    }

                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SECRET, // Utilisation de la variable d'environnement
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
