const express = require("express");
const {
    createSOS
    , getAllSos
    , getSosById
    , getActiveSos
    , assignVolunteer,
    updateStatus,
    getVolunteers
} = require("../controllers/sos")
// import  authorizeRoles   from "../middleware/role.js";

const router = express.Router();

// sos.post("/create", authorizeRoles("user"), createSOS);
router.post("/createSOS", createSOS);
router.get("/getAllSOS", getAllSos)
router.get("/getActiveSOS", getActiveSos)
router.get("/getSOSById/:id", getSosById)
router.put("/assignVolunteer/:id", assignVolunteer)
router.put("/updateStatus/:id", updateStatus)
router.get("/getVolunteers",getVolunteers)
module.exports = router;