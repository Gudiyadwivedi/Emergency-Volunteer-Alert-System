'use strict';

var catalyst = require('zcatalyst-sdk-node');

const auth = require("../backend/functions/evas_function/router/authRouter.js");
const sos = require("../backend/functions/evas_function/router/sos.js");

module.exports = async (req, res) => {
    try {
        console.log("🔥 Catalyst function triggered");

        const catalystApp = catalyst.initialize(req);

        req.catalystApp = catalystApp;

        const url = req.url || "";
        const method = req.method;

        // ---------------- ROUTING ----------------

        if (url.includes("/api/v1/auth")) {
            return await auth(req, res);
        }

        if (url.includes("/api/v1/sos")) {
            return await sos(req, res);
        }

        return res.status(200).send({
            success: true,
            message: "Catalyst backend working",
            method,
            url
        });

    } catch (error) {
        console.error("Error:", error);

        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};