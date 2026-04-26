import { Router } from "express";
import { registerUser } from "../controllers/authController.js";

const auth = Router();

auth.post("/register", registerUser);

export default auth;