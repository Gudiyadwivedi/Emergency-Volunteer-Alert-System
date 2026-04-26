import User from "../models/user.js";
// REGISTER USER / VOLUNTEER
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, email, phone, password)",
      });
    }

    // only allow user and volunteer
    const allowedRoles = ["user", "volunteer"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: finalRole,
    });

    // generate tokens
  

    res.status(201).json({
      success: true,
      message: "Volunteer registered successfully. Waiting for admin verification.",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while registering user",
      error: error.message,
    });
  }
};