import { Router } from "express";
import { registerUser,sendOTP,verifyOTP ,getById ,login,logout} from "../controllers/authController.js";

const auth = Router();

auth.post("/register", registerUser);
auth.post("/sendOtp",sendOTP)
auth.post("/verifyOTP",verifyOTP)
auth.get("/getById/:id",getById)
auth.post("/login",login)
auth.post("/logout",logout)

export default auth;