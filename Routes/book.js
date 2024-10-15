const express = require('express');
const router = express.Router();

const auth = require('../Middlewares/auth');
const { upload, resizeImageMiddleware } = require('../Middlewares/multer-config'); // Importation de multer et sharp

const bookCtrl = require('../Controllers/bookController');

router.get('/', bookCtrl.getAllBooks);

router.post('/', auth, upload, resizeImageMiddleware, bookCtrl.createBook); // Ajout de resizeImageMiddleware après upload

router.get('/bestrating', bookCtrl.getBestRatedBooks);

router.get('/:id', bookCtrl.getOneBook);

router.put('/:id', auth, upload, resizeImageMiddleware, bookCtrl.modifyBook); // Ajout de resizeImageMiddleware après upload

router.delete('/:id', auth, bookCtrl.deleteBook);

router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;