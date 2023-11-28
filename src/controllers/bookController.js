const userModel = require("../models/userModels");
const bookModel = require("../models/bookModels");
const reviewModel = require("../models/reviewModels")

const { isValidRequestBody, isValidData, isValidISBN, isValidReleasedAt, isValidObjectId } = require("../utils/validator");

const aws = require("../aws/awsController")

//============================================< CREATE BOOK >===============================================//

const createBook = async function (req, res) {
    try {
        const data = req.body;

        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt, bookCover } = data;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

        if (!isValidData(title)) {
            return res.status(400).send({ status: false, message: "Title is Required" });
        }

        let duplicateTitle = await bookModel.findOne({ title });

        if (duplicateTitle) {
            return res.status(400).send({ status: false, msg: "Title already exist" });
        }

        if (!isValidData(excerpt)) {
            return res.status(400).send({ status: false, message: "Excerpt is Required" });
        }

        if (!isValidData(userId)) {
            return res.status(400).send({ status: false, message: "userId is Required" });
        }

        if (!isValidObjectId.test(userId)) {
            return res.status(400).send({ status: false, message: `${userId} in a Invalid userId` });
        }

        let userDetails = await userModel.findById({ _id: userId });
        if (!userDetails) {
            return res.status(404).send({ status: false, message: `${userId} does not exists` });
        }

        // This is authorization part
        if (userId != req.userId) {
            return res.status(403).send({ status: false, message: "You Are Not Unauthorized" });
        }

        if (!isValidData(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN is Required" });
        }

        let duplicateISBN = await bookModel.findOne({ ISBN: ISBN });

        if (duplicateISBN) {
            return res.status(400).send({ status: false, msg: "ISBN already exist" });
        }

        if (!isValidISBN.test(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN is invalid" });
        }

        if (!isValidData(category)) {
            return res.status(400).send({ status: false, message: "Category is Required" });
        }

        if (!isValidData(subcategory)) {
            return res.status(400).send({ status: false, message: "Subcategory is Required" });
        }

        if (!Array.isArray(subcategory)) {
            return res.status(400).send({ status: false, message: "Subcategory Must be in Array" });
        }

        if (Array.isArray(subcategory)) {
            if (subcategory.length == 0) {
                return res.status(400).send({ status: false, message: "Subcategory should not be empty" });
            }
        }

        if (!isValidData(releasedAt)) {
            return res.status(400).send({ status: false, message: "Please Provide the release date of the book" });
        }

        if (!isValidReleasedAt.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "The Format of the release date should be look like 'YYYY-MM-DD'" });
        }


        // let bookData = { title, excerpt, userId, ISBN, category, subcategory, releasedAt }

        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await aws.uploadFile(files[0])

            data.bookCover = uploadedFileURL
        } else {
            res.status(400).send({ msg: "No file found" })
        }

        let newBook = await bookModel.create(data)

        res.status(201).send({ status: true, message: "Book is created successfully", data: newBook });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

//============================================< GET BOOKS BY QUERY >===============================================//

const getBooks = async function (req, res) {
    try {
        let requestQuery = req.query;

        let findBooks = await bookModel.find({ requestQuery, isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        findBooks.sort(function (a, b) {
            return a.title.localeCompare(b.title)
        })

        if (!findBooks) {
            return res.status(404).send({ status: false, msg: "No Book Data Found" })
        }

        res.status(200).send({ status: true, msg: "All Books", data: findBooks })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

//============================================< GET BOOKS BY PARAMS >===============================================//

const getBooksById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        if (!isValidObjectId.test(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter the valid book Id" })
        }

        let findBookId = await bookModel.findById({ _id: bookId, isDeleted: false }).select({ ISBN: 0 })
        if (!findBookId)
            return res.status(404).send({ status: false, msg: "No Book Data Found" })

        let { _id, title, excerpt, userId, category, subcategory, review, isDeleted, deletedAt, releasedAt, createdAt, updatedAt } = findBookId;

        // let alldata = {}

        let reviewsData = await reviewModel.find({ bookId: bookId }).select({ isDeleted: 0 })

        // alldata["reviewData"] = reviewsData


        let bookDetails = { _id, title, excerpt, userId, category, subcategory, review, isDeleted, deletedAt, releasedAt, createdAt, updatedAt, reviewsData }

        res.status(200).send({ status: true, msg: "All Books", data: bookDetails })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

//============================================< UPDATE BOOK >===============================================//

const updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let requestBody = req.body

        if (!bookId) {
            return res.status(400).send({ status: false, message: "Book Id is Required" })
        }

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

        if (!isValidObjectId.test(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter the valid book Id" })
        }

        let findBookId = await bookModel.findById({ _id: bookId })
        if (!findBookId)
            return res.status(404).send({ status: false, msg: "Book Not Found" })

        let is_Deleted = findBookId.isDeleted
        if (is_Deleted == true)
            return res.status(400).send({ status: false, message: "Book is already Deleted" })

        // This is authorization part
        if (findBookId.userId != req.userId) {
            return res.status(403).send({ status: false, message: "You Are Not Unauthorized" });
        }

        let { title, ISBN } = requestBody

        let duplicateTitle = await bookModel.findOne({ title });
        if (duplicateTitle) {
            return res.status(400).send({ status: false, msg: "Title already exist" });
        }

        let duplicateISBN = await bookModel.findOne({ ISBN });
        if (duplicateISBN) {
            return res.status(400).send({ status: false, msg: "ISBN already exist" });
        }

        let updateBook = await bookModel.findOneAndUpdate({ _id: bookId }, { requestBody }, { new: true })
        return res.status(200).send({ status: true, message: "Book Data Updated Successfully", data: updateBook })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });

    }
}

//============================================< DELETE BOOK >===============================================//

const deleteBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        if (!bookId) {
            return res.status(400).send({ status: false, message: "Book Id is Required" })
        }

        if (!isValidObjectId.test(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter the valid book Id" })
        }

        let findBookId = await bookModel.findById({ _id: bookId })
        if (!findBookId) {
            return res.status(404).send({ status: false, msg: "Book Not found" })
        }

        // This is authorization part
        if (findBookId.userId != req.userId) {
            return res.status(403).send({ status: false, message: "You Are Not Unauthorized" });
        }

        let isDeletedBook = findBookId.isDeleted
        if (isDeletedBook == true) {
            return res.status(400).send({ status: false, msg: "Book is already deleted" })
        } else {
            const deleteBook = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
            return res.status(200).send({ status: true, message: "Book Data Deleted Successfully", data: deleteBook })
        }

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = { createBook, getBooks, getBooksById, updateBooks, deleteBooks };