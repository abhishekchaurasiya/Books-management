const userModel = require("../models/userModels");
const jwt = require("jsonwebtoken");

const { isValidData, isValidRequestBody, isValidEmail, isValidPhone, isValidName } = require("../utils/validator");

//======================================= < CREATING USER > =========================================

const createUser = async function (req, res) {
    try {

        let requestBody = req.body;

        let { title, name, phone, email, password, address } = requestBody;

        // Validation Starts......

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

        if (!isValidData(title)) {
            return res.status(400).send({ status: false, message: "Title is required." });
        }

        if (title !== "Mr" && title !== "Mrs" && title !== "Miss") {
            return res.status(400).send({ status: false, message: "title should be  Mr, Mrs, Miss" });
        }

        if (!isValidData(name)) {
            return res.status(400).send({ status: false, message: "Name is required." });
        }

        if (!isValidName.test(name)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid Name" })
        }

        if (!isValidData(phone)) {
            return res.status(400).send({ status: false, message: "Phone is required." });
        }

        if (!isValidPhone.test(phone)) {
            return res.status(400).send({ status: false, message: "Please enter a valid phone number" });
        }

        let isPhoneAlreadyUsed = await userModel.findOne({ phone });

        if (isPhoneAlreadyUsed) {
            return res.status(400).send({ status: false, msg: "Phone number already exist" });
        }

        if (!isValidData(email)) {
            return res.status(400).send({ status: false, message: "Email is required." });
        }

        if (!isValidEmail.test(email)) {
            return res.status(400).send({ status: false, message: "Please enter valid a email " });
        }

        let isEmailAlreadyUsed = await userModel.findOne({ email });

        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, msg: "Email already exist" });
        }

        if (!isValidData(password)) {
            return res.status(400).send({ status: false, message: "Password is required." });
        }

        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, msg: "Password Should be minimum 8 characters and maximum 15 characters", });
        }

        if (typeof address !== "object") {
            return res.status(400).send({ status: false, message: "Address must be in Object" });
        }

        // Validation Ends...

        let userData = { title, name, phone, email, password, address }

        let createData = await userModel.create(userData);
        res.status(201).send({ status: true, message: "User data created successfully", data: createData, });
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

//========================================= < LOGIN USER > ============================================

const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

        const { email, password } = requestBody;

        if (!isValidData(email)) {
            return res.status(400).send({ status: false, message: "Email is required." });
        }

        if (!isValidEmail.test(email)) {
            return res.status(400).send({ status: false, message: "Please enter valid a email " });
        }

        if (!isValidData(password)) {
            return res.status(400).send({ status: false, message: "Password is required." });
        }

        const matchUser = await userModel.findOne({ email, password });

        if (!matchUser) {
            return res.status(404).send({ status: false, message: "Invalid login credentials" });
        }

        const token = jwt.sign(
            {
                userId: matchUser._id.toString(),
                Project: "Book Management",
                batch: "Uranium",
                iat: Math.floor(Date.now() / 1000), //Issued At- the time at which the JWT was issued.              
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60 // 1 hour expire token time 
            }, "Project-03_group-28");

        res.setHeader("x-user-key", token)
        return res.status(200).send({ status: true, message: "User Login successfully", data: {token}, });
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { createUser, loginUser };  