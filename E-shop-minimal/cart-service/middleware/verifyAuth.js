const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.secretkey);
    req.userData = { userId: decoded.id, email: decoded.email };
  } catch (err) {
    return res.send(err);
  }
  return next();
};

module.exports = verifyToken;
