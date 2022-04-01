const jwt = require("jsonwebtoken");
require("dotenv").config();


const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    console.log(req.url + " unauthorized access attempt " + new Date().toUTCString());
    return res.status(403).send("A token is required for authentication");
  }
  try {
    //console.log(token);
    //console.log(process.env.TOKEN_KEY);
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    //console.log(decoded);
    req.user = decoded;
  } catch (err) {
    console.log(err);
    console.log(new Date().toUTCString());
    return res.status(401).send("Invalid Token " + err + " " + new Date().toUTCString());
  }
  // console.log("calling next");
  return next();
};

module.exports = verifyToken;