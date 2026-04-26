import mongoose from "mongoose";
import User from "../models/user.js";

const refreshAccess = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // (consider hashing later)
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    console.error("refreshAccess error:", error);
    throw error;
  }
};

export default refreshAccess;