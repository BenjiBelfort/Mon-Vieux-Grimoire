const Book = require('../Models/Book')
const fs = require('fs');
const path = require('path');

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

    // Trouver le livre dans la base de données
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        // Vérifier que l'utilisateur est bien celui qui a créé le livre
        if (book.userId != req.auth.userId) {
            return res.status(401).json({ message: 'Non-autorisé' });
        }

        // Si une nouvelle image est téléchargée, supprimer l'ancienne
        if (req.file) {
            const oldFilename = book.imageUrl.split('/images/')[1];
            const oldFilePath = path.join('images', oldFilename);

            // Supprimer l'ancienne image
            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error("Erreur lors de la suppression de l'ancienne image", err);
                } else {
                    console.log("Ancienne image supprimée :", oldFilename);
                }
            });
        }

        // Mettre à jour les informations du livre dans la base de données
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié !' }))
          .catch(error => res.status(401).json({ error }));
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
      .then(books => {
          if (!books || books.length === 0) {
              return res.status(404).json({ message: 'Aucun livre trouvé' });
          }
          res.status(200).json(books);
      })
      .catch(error => res.status(400).json({ error: 'Erreur lors de la récupération des livres' }));
};

exports.rateBook = (req, res, next) => {
    const bookId = req.params.id;
    const { userId, rating } = req.body;

    if (!userId || typeof rating !== 'number' || rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'Note invalide. Elle doit être comprise entre 0 et 5.' });
    }
  
    Book.findById(bookId)
      .then(book => {
        if (!book) {
          return res.status(404).json({ message: 'Livre non trouvé' });
        }
  
        const existingRating = book.ratings.find(r => r.userId === userId);
        if (existingRating) {
          return res.status(400).json({ message: 'Utilisateur a déjà noté ce livre' });
        }
  
        book.ratings.push({ userId, grade: rating });
        const totalRating = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        book.averageRating = (totalRating / book.ratings.length).toFixed(1);
  
        book.save()
          .then(() => res.status(200).json(book))
          .catch(error => res.status(400).json({ error: 'Erreur lors de la sauvegarde' }));
      })
      .catch(error => res.status(400).json({ error: 'Erreur lors de la récupération du livre' }));
};
  
  
  
