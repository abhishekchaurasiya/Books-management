const reviewModel = require("../models/reviewModels");
const bookModel = require("../models/bookModels");

const { isValidRequestBody, isValidData, isValidObjectId } = require("../utils/validator");

// Here Start Bookreview
const bookReview = async function (req, res) {
    try {

        const bookIds = req.params.bookId
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

        if (!isValidObjectId.test(bookIds)) {
            return res.status(400).send({ status: false, message: "Please enter the valid book Id" })
        }

        let findBookId = await bookModel.findById({ _id: bookIds })
        if (!findBookId) {
            return res.status(404).send({ status: false, message: "No book found with this id" })
        }

        let is_Deleted = findBookId.isDeleted;
        if (is_Deleted == true) {
            return res.status(404).send({ status: false, message: "Book is already deleted" })
        }

        let { bookId, rating, reviewedBy, reviewedAt } = requestBody;

        requestBody.bookId = bookIds

        if (!isValidData(reviewedBy)) {
            requestBody.reviewedBy = "Guest"
        }

        if (!isValidObjectId.test(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter the valid book Id" })
        }

        if (!isValidData(rating)) {
            return res.status(400).send({ status: false, msg: "Please provied  the rating  " })
        }

        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, msg: "Rating Should be minimum 1 and maximum 5" });
        }

        if (!isValidData(reviewedAt)) {
            return res.status(400).send({ status: false, msg: "Reviewed At is required" })
        }

        let updatedBook = await bookModel.findOneAndUpdate({ _id: bookId, }, { $inc: { reviews: +1 } }, { new: true })

        const reviewCreation = await reviewModel.create(requestBody);

        res.status(201).send({ status: true, message: "sucessfully created", data: { updatedBook, reviewsData: reviewCreation } })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};
// Here Ends Bookreview



// Here start Update 

const reviewUpdate = async function (req, res) {
    try {
        let { bookId, reviewId } = req.params;

        let requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

        if (!isValidObjectId.test(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter the valid book Id" });
        }

        let findBookId = await bookModel.findById({ _id: bookId })
        if (!findBookId) {
            return res.status(404).send({ status: false, message: "No book found with this id" });
        }

        if (findBookId.isDeleted == true) {
            return res.status(400).send({ status: false, message: "Book is already deleted" })
        }


        if (!isValidObjectId.test(reviewId)) {
            return res.status(400).send({ status: false, message: "Please enter the valid review Id" });
        }

        let findReviewId = await reviewModel.findById({ _id: reviewId });
        if (!findReviewId) {
            return res.status(404).send({ status: false, message: "No review data found with this id" });
        }

        let { review, rating, reviewedBy } = requestBody;

        if (!isValidData(rating)) {
            return res.status(400).send({ status: false, msg: "Please provied the rating  " })
        }

        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, msg: "Rating Should be minimum 1 and maximum 5" });
        }

        if (!isValidData(review)) {
            return res.status(400).send({ status: false, msg: "Please provied the review" })
        }

        // if (!isValidData(reviewedBy)) {
        //     return res.status(400).send({ status: false, msg: "Please provide the reviewer's name " })
        // }

        let updateReview = await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { requestBody } }, { new: true });

        res.status(200).send({ status: true, message: "Review Updated Successfully", data: findBookId, updateReview });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
// Here Ends Update 


// Here Starts Review delete 
const reviewDelete = async function (req, res) {
    try {
        let { bookId, reviewId } = req.params;

        if (!isValidObjectId.test(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter the valid book Id" });
        }

        let findBookId = await bookModel.findById({ _id: bookId, isDeleted: false })
        if (!findBookId) {
            return res.status(404).send({ status: false, message: "No book found with this id" });
        }

        if (findBookId.isDeleted == true) {
            return res.status(400).send({ status: false, message: "Book is already deleted" })
        }

        if (!isValidObjectId.test(reviewId)) {
            return res.status(400).send({ status: false, message: "Please enter the valid review Id" });
        }

        let findReviewId = await reviewModel.findById({ _id: reviewId, isDeleted: false });
        if (!findReviewId) {
            return res.status(404).send({ status: false, message: "No review data found with this id" });
        }

        if (findReviewId.isDeleted == true) {
            return res.status(400).send({ status: false, message: "Review Data is already deleted" })
        }

        const deleteReview = await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true }, { new: true })
        const bookReviewUpdated = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } }, { new: true })

        res.status(200).send({ status: true, message: "Review Deleted Successfully", data: bookReviewUpdated, deleteReview });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
// Here Ends Review delete 


module.exports = { bookReview, reviewUpdate, reviewDelete }