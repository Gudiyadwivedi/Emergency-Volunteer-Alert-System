import User from "../models/user.js";
import { generateOTP } from "../utils/generate.js";
import { sendEmail } from "../utils/nodeMailer.js";

import refreshAccess from "../utils/token.js"
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


export const updateUser = async (req, res) => {
  try {
    const userId = req?.params?.id;
    const data = req.body || {};
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide user data"
      });
    }
    const updatedUser = await updateUser(req, userId, data);
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error during user update"
    });
  }
};


export const getById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please pass user id",
      });
    }

    const user = await User.findById(id).select("-password -otp");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error during user fetching",
      error: error.message,
    });
  }
};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const deleteUser = async (req, res) => {
  try {
    const ids = req.body.ids; // expecting array

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please pass an array of user ids to delete"
      });
    }
    const response = await User.deleteMany({ _id: { $in: ids } });
    return res.status(200).json({
      success: true,
      message: "Users deleted successfully",
      deletedCount: response.deletedCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to bulk delete users",
      error: error.message
    });
  }
};
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    const otp = generateOTP(6);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await User.updateOne(
      { email },
      {
        $set: { otp, otpExpiresAt }
      }
    );

    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });
console.log("user",user)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

await User.updateOne(
  { email },
  {
    $set: {
      isVerified: true,
      otp: null,
      otpExpiresAt: null
    }
  }
);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.log("OTP Verify Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, old password and new password are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ use schema method (clean + reusable)
    const isMatch = await user.isPasswordCorrect(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect"
      });
    }

    // optional safety check
    const isSame = await user.isPasswordCorrect(newPassword);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password"
      });
    }

    user.password = newPassword;

    await user.save();



    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




export const createPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.password = newPassword; // will be hashed by pre-save hook
    user.isVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password created successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "User not verified",
      });
    }
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const { accessToken, refreshToken} = await refreshAccess(user._id);
    // console.log({accessToken, refreshToken})

    const userData = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "Login successful",
        data: {
          user: userData,
          accessToken,
          refreshToken,
        },
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "User already logged out",
      });
    }

    // find user by refresh token
    const user = await User.findOne({ refreshToken: token });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid session",
      });
    }

    // remove refresh token from DB
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "Logged out successfully",
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.forgotPassword = async (req, res) => {
//   try {
//     const catalystApp = catalyst.initialize(req, { scope: "admin" });
//     const zcql = catalystApp.zcql();
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required"
//       });
//     }
//     const checkEmail = query.checkEmailQuery(email);
//     const result = await zcql.executeZCQLQuery(checkEmail);
//     if (!result.length) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: "password forget successful"
//     });
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
