const checkRating = (req, res, next) => {
    console.log('Corps de la requête dans checkRating:', req.body); // Vérifiez ce qui est reçu
    const { rating } = req.body;

    // Vérifiez si rating est défini et valide
    if (typeof rating !== 'number' || rating <= 0 || rating > 5) {
        return res.status(400).json({ message: 'Note invalide. Elle doit être comprise entre 1 et 5.' });
    }

    next();
};

module.exports = checkRating;