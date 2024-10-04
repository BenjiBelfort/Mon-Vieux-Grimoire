const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const mongooseUniqueValidator = require('mongoose-unique-validator');

// Inscription
exports.signup = (req, res, next) => {
    console.log("Inscription requise:", req.body);
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => {
            // Vérifiez si l'erreur est liée à la validation d'unicité
            if (error.name === 'ValidationError') {
              return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
            }
            res.status(400).json({ error });
          });
        })
    .catch(error => res.status(500).json({ error }));
};

// Connexion
exports.login = (req, res) => {
    console.log("Connexion requise:", req.body);
    
    const { email, password } = req.body;
  
    // Recherche de l'utilisateur par email
    User.findOne({ email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
  
        // Vérification du mot de passe
        return bcrypt.compare(password, user.password)
          .then(isPasswordValid => {
            if (!isPasswordValid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
  
            // Création du token JWT
            const token = jwt.sign(
              { userId: user._id },
              'RANDOM_SECRET_KEY',
              { expiresIn: '24h' }
            );
  
            res.status(200).json({ userId: user._id, token });
          });
      })
    .catch(error => res.status(500).json({ error: error.message }));
};

