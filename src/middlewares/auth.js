const  jwt  = require("jsonwebtoken");

const authmiddleware = (req, res, next) => {
  console.log("hit")
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "no token provided , Login!!!" });
    }

    const verify_token = jwt.verify(token, process.env.JWT_SECRETE);
    if (!verify_token) {
      return res.status(401).json({ message: "invalid token sign In" });
    }
    req.user = verify_token;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Token expired" });
  }
};

module.exports = authmiddleware;
