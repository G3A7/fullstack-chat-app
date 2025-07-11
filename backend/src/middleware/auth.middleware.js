import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provide" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provide" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "user Not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute Middleware", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
