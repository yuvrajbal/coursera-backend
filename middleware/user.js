const jwt = require("jsonwebtoken");
require("dotenv").config();

function userMiddleware(req, res, next) {
  const token = req.headers.authorization;

  const decoded = jwt.verify(token, process.env.JWT_USER_PASSWORD);
  if (decoded) {
    req.userId = decoded.id;
    next();
  } else {
    res.status(403).json({
      message: "You are not signed in",
    });
  }
}

module.exports = {
  userMiddleware: userMiddleware,
};
