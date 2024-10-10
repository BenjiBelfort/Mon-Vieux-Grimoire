const Book = require('../Models/Book')
const fs = require('fs');

exports.createBook = (req, res, next) => {
    console.log(req.body.book);
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => res.status(400).json( { error } )); 
};

// exports.modifyBook = (req, res, next) => {
//     Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
//         .then(book => res.status(200).json({ message: 'Livre modifié !' }))
//         .catch(error => res.status(400).json( { error } ));
// };

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non-autorisé' });
        } else {
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({message: 'Livre modifié !'}))
            .catch(error => res.status(401).json({ error }))
        }
      })
      .catch(error => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non-autorisé' });
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id })
                .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(400).json( { error } ));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json( { error } ));
};

// Affiche les livres les mieux notés
exports.getBestRatedBooks = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
    const userId = req.auth.userId;
    const grade = parseFloat(req.body.grade);

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // Vérifier si l'utilisateur a déjà noté le livre
            const existingRating = book.ratings.find(rating => rating.userId === userId);
            if (existingRating) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
            }

            // Ajouter la nouvelle note
            book.ratings.push({ userId: userId, grade: grade });

            // Recalculer la note moyenne
            const totalRatings = book.ratings.length;
            const totalGrade = book.ratings.reduce((sum, rating) => {
                // Vérifier que chaque note est valide
                return sum + (rating.grade ? rating.grade : 0);
            }, 0);
            book.averageRating = totalGrade / totalRatings;

            // Enregistrer les changements
            book.save()
                .then(() => res.status(200).json({ message: 'Note ajoutée avec succès !', book }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
