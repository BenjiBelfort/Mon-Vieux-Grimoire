const express = require('express');
const router = express.Router();

const auth = require('../Middlewares/auth');
const multer = require('../Middlewares/multer-config')

const bookCtrl = require('../Controllers/bookController');

router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/bestrating', bookCtrl.getBestRatedBooks);

router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;