const express = require('express');
const router = express.Router()


const { createUser, loginUser } = require("../controllers/userController");

const { createBook, getBooks, getBooksById, updateBooks, deleteBooks } = require("../controllers/bookController");

const { bookReview, reviewUpdate, reviewDelete } = require("../controllers/reviewController")

const { authentication } = require("../middlewares/mid");

// User APIs
router.post("/register", createUser);

router.post("/login", loginUser);

//  Books APIs
router.post("/books", authentication, createBook);

router.get("/books", authentication, getBooks);

router.get("/books/:bookId", authentication, getBooksById);

router.put("/books/:bookId", authentication, updateBooks);

router.delete("/books/:bookId", authentication, deleteBooks);

//  Review APIs
router.post("/books/:bookId/review", bookReview)

router.put("/books/:bookId/review/:reviewId", reviewUpdate)

router.delete("/books/:bookId/review/:reviewId", reviewDelete)


module.exports = router;