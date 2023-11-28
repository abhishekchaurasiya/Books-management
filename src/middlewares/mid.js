const jwt = require("jsonwebtoken");

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-user-key"];
        if (!token) token = req.headers["X-User-Key"]
        if (!token)
            return res.status(400).send({ status: false, message: "Token required! Please login to generate token" });

        let decodedToken = jwt.verify(token, "Project-03_group-28");
        if (!decodedToken)
            return res.status(400).send({ status: false, message: "Inter valid token" });

        // let verifyToken = decodedToken
        // if (!verifyToken) {
        //     return res.status(401).send({
        //         status: false,
        //         message: "Token is either Invalid or Expired. User Must log in with Valid details."
        //     })
        // }

        req.userId = decodedToken.userId

        next();

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { authentication }
