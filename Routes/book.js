const express = require('express');
const router = express.Router();

const auth = require('../Middlewares/auth');
const multer = require('../Middlewares/multer-config');
const checkRating = require('../Middlewares/checkRating');

const bookCtrl = require('../Controllers/bookController');

router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, bookCtrl.createBook);

router.get('/bestrating', bookCtrl.getBestRatedBooks);

router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

router.post('/:id/rating', auth, checkRating, bookCtrl.rateBook);

module.exports = router;