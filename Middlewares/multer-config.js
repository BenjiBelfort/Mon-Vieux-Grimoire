const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// mise en mémoire pour traiter l'image avec Sharp
const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('image');

const resizeImageMiddleware = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const bookObject = JSON.parse(req.body.book);
        const name = bookObject.title.split(' ').join('_');
        const extension = MIME_TYPES[req.file.mimetype];
        const fileName = name + Date.now() + '.' + extension;
        const outputPath = path.join('images', fileName);

        // Application de Sharp pour redimensionner l'image
        await sharp(req.file.buffer)
            .resize(400)
            .toFile(outputPath);

        // mise à jour du nom de fichier
        req.file.filename = fileName;
        console.log("image enregistrée !");
        next();
    } catch (error) {
        console.error("Erreur lors du traitement de l'image avec Sharp", error);
        res.status(500).json({ message: "Erreur lors du traitement de l'image." });
    }
};

module.exports = { upload, resizeImageMiddleware };
