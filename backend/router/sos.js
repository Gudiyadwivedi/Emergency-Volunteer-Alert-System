import { Router } from "express";
import { createSOS }  from "../controllers/sos.js";
import  authorizeRoles   from "../middleware/role.js";

const sos = Router();

// sos.post("/create", authorizeRoles("user"), createSOS);
sos.post("/create", createSOS);

export default  sos;