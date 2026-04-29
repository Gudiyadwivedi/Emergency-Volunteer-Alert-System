// authController.js - Fixed for your exact table structure
'use strict';

const catalyst = require("zcatalyst-sdk-node");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const { generateOTP } = require("../utils/generate.js");
const { sendEmail } = require("../utils/nodeMailer.js");
const refreshAccess = require("../utils/token.js");

// ============================
// HELPERS
// ============================
async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}
// ============================
// REGISTER USER
// ============================
exports.registerUser = async (req, res) => {
    try {
        console.log("=== Register User Request ===");
        console.log("Request Body:", req.body);

        const catalystApp = catalyst.initialize(req);

        const {
            name,
            email,
            phone,
            password,
            role,
            address,
            medicalInfo,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

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

        // check existing user using Catalyst ZCQL - Using correct table name "userTable"
        try {
            const zcql = catalystApp.zcql();
            const checkQuery = `SELECT * FROM userTable WHERE email = '${email}'`;
            console.log("Check Query:", checkQuery);

            const existingUsers = await zcql.executeZCQLQuery(checkQuery);
            console.log("Existing Users:", existingUsers);

            if (existingUsers && existingUsers.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "User already exists with this email",
                });
            }
        } catch (dbError) {
            console.error("Database check error:", dbError);
        }

        // Hash password before saving
        const hashedPassword = await hashPassword(password);
        console.log("Password hashed successfully");

        // Create user in Catalyst Data Store - Using correct table name "userTable"
        const datastore = catalystApp.datastore();
        const table = datastore.table("userTable");
        const otp = generateOTP(6);
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const userData = {
            name: name,
            email: email,
            phone: phone,
            password: hashedPassword,
            role: finalRole,
            isVerified: false,
            otp: null,
            otpExpiresAt: null,
            refreshToken: null,
            address: address || "",
            medicalInfo: medicalInfo || "",
            emergencyContactName: emergencyContactName || "",
            emergencyContactPhone: emergencyContactPhone || "",
            otp: otp,
            otpExpiresAt: otpExpiresAt
        };

        console.log("User Data to insert:", userData);

        const user = await table.insertRow(userData);
        console.log("User created successfully:", user);

        try {
            await sendEmail({
                to: email,
                subject: "Verify Your Email - EVAS",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #dc2626;">Welcome to EVAS!</h2>
                        <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
                        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>This OTP is valid for 5 minutes.</p>
                        <p>If you didn't create an account with EVAS, please ignore this email.</p>
                    </div>
                `,
            });
            console.log("OTP email sent successfully");
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email with the OTP sent.",
            user: {
                ROWID: user.ROWID,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: false
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);

        res.status(500).json({
            success: false,
            message: "Server error while registering user",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ============================
// SEND OTP
// ============================
exports.sendOTP = async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const zcql = catalystApp.zcql();
        const query = `SELECT * FROM userTable WHERE email = '${email.trim()}'`;
        const users = await zcql.executeZCQLQuery(query);

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];
        const otp = generateOTP(6);
        const expiry = new Date(Date.now() + 5 * 60000);

        const datastore = catalystApp.datastore();
        const table = datastore.table("userTable");

        await table.updateRow({
            ROWID: user.ROWID,
            otp: otp,
            otpExpiresAt: expiry
        });

        await sendEmail({
            to: email,
            subject: "OTP Verification - EVAS",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Email Verification</h2>
                    <p>Your OTP for email verification is:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 5 minutes.</p>
                </div>
            `
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email"
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
            error: error.message
        });
    }
};

// ============================
// VERIFY OTP
// ============================
exports.verifyOTP = async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const zcql = catalystApp.zcql();
        const query = `SELECT * FROM userTable WHERE email = '${email.trim()}'`;
        const users = await zcql.executeZCQLQuery(query);
        console.log()
        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];
        console.log(String(user.otp))
        console.log(String(otp))

        if (String(users[0].userTable.otp) !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (new Date() > new Date(user.otpExpiresAt)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        const datastore = catalystApp.datastore();
        const table = datastore.table("userTable");

        await table.updateRow({
            ROWID: users[0].userTable.ROWID,
            isVerified: true,
            otp: null,
            otpExpiresAt: null
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now login."
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({
            success: false,
            message: "Verification failed",
            error: error.message
        });
    }
};

// ============================
// LOGIN
// ============================


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Hello")
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        console.log("email", email)
        console.log("password", password)

        // Catalyst initialize
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();

        // Find user by email
        const query = `SELECT * FROM userTable WHERE email = '${email}'`;
        const result = await zcql.executeZCQLQuery(query);

        if (!result.length) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = result[0].userTable;

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = await refreshAccess(user.ROWID, req);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "Login successful",
                accessToken,
                refreshToken,
                user: {
                    id: user.ROWID,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                },
            });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};




// ============================
// LOGOUT
// ============================
exports.logout = async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Already logged out"
            });
        }

        const zcql = catalystApp.zcql();
        const query = `SELECT * FROM userTable WHERE refreshToken = '${token}'`;
        const users = await zcql.executeZCQLQuery(query);

        if (users.length) {
            const datastore = catalystApp.datastore();
            const table = datastore.table("userTable");
            await table.updateRow({
                ROWID: users[0].userTable.ROWID,
                refreshToken: null
            });
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        };

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "Logged out successfully"
            });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// GET USER BY ID
// ============================
exports.getById = async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Please pass user id"
            });
        }

        const datastore = catalystApp.datastore();
        const table = datastore.table("userTable");
        const user = await table.getRow(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Remove sensitive fields
        delete user.password;
        delete user.otp;

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error during user fetching",
            error: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req, { scope: "admin" });
        const id = req.params.id
        console.log(id)
        const data = req.body
        if (!id) {
            return res.status(400).json({ success: false, message: "ID parameter is required" });
        }
        const table = catalystApp.datastore().table("userTable")
        const updateddata = await table.updateRow({ROWID:id,data});
        console.log("up",updateddata)
        res.status(200).json({
            success: true,
            message: "user updated successfully",
            updateddata
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "unable to update  user",
            data: error
        });
    }
}



exports.getAllUsers = async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const zcql = catalystApp.zcql();

    const query = `
      SELECT ROWID, name, email, phone, role, isVerified,
             address, bloodGroup, medicalInfo,
             emergencyContactName, emergencyContactPhone,
             CREATEDTIME
      FROM userTable
      ORDER BY CREATEDTIME DESC
    `;

    const result = await zcql.executeZCQLQuery(query);

    const users = result.map((row) => ({
      id: row.userTable.ROWID,
      name: row.userTable.name,
      email: row.userTable.email,
      phone: row.userTable.phone,
      role: row.userTable.role,
      isVerified: row.userTable.isVerified,
      address: row.userTable.address,
      bloodGroup: row.userTable.bloodGroup,
      medicalInfo: row.userTable.medicalInfo,
      emergencyContactName: row.userTable.emergencyContactName,
      emergencyContactPhone: row.userTable.emergencyContactPhone,
      createdTime: row.userTable.CREATEDTIME,
    }));

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};