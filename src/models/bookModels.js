const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    excerpt: {
        type: String,
        required: true,
        trim: true
    },
    bookCover: {
        type: String
    }
    ,
    userId: {
        type: ObjectId,
        ref: "User",
        required: true,
        trim: true
    },

    ISBN: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    subcategory: {
        type: [String],
        required: true,
        trim: true
    },

    reviews: {
        type: Number,
        default: 0
    },

    deletedAt: {
        type: Date
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    releasedAt: {
        required: true,
        type: Date
    },


}, { timestamps: true });


module.exports = mongoose.model('Book', bookSchema)
