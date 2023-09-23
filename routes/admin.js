const express = require('express');
const { adminSignup, adminLogin, addBook, getBooks, getBookById, getBookByIdAndUpdate, delBookById } = require('../controllers/adminController');
const verifyAdminToken = require('../middelwares/auth');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('admin router');
});

router.post('/signup',adminSignup)
router.post('/login',adminLogin)
router.use(verifyAdminToken);

router.post('/add-book', addBook)
router.get('/books',getBooks)
router.get('/get-book/:id',getBookById)
router.put('/books/:id',getBookByIdAndUpdate)
router.delete('/del-book/:id',delBookById)

module.exports = router;
