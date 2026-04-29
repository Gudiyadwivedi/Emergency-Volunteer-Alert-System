const express = require("express");

const {
    registerUser,
    sendOTP,
    verifyOTP,
    login,
    logout,
    getById,
    updateUser,
    getAllUsers
} = require("../controllers/authController.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/sendOtp", sendOTP);
router.post("/verifyOTP", verifyOTP);
router.get("/getById/:id", getById);
router.post("/login", login);
router.post("/logout", logout);
router.put("/updateUser/:id",updateUser)
router.get("/getAllUsers",getAllUsers)
module.exports = router;