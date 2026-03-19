//valid jwt tokenn or not
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-passwordHash");
    if (!req.user) {
      console.log("User not found brother");
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch {
    console.log("Token not found");
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };
