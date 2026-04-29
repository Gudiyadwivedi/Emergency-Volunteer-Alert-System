const express = require("express");
const path = require("path");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 8000


//  ------------------------------
// Middleware to parse JSON and URL-encoded data AND APP USE STATIC FILES
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
// app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/", express.static(path.join(__dirname, "./client")));

// ✅ Sabse simple - kisi bhi origin ko allow
app.use(cors({
  origin: 'http://localhost:5173',  // Vite frontend URL
  credentials: true,                  // Cookies allow karne ke liye
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const user = require("./router/authRouter");
const bomRouter = require("./router/sos");


app.use('/app/v1/user', user);
app.use('/app/v1/sos',bomRouter);

// app.use('/app/v1/salesPersonRouter',salesPersonRouter)

app.get("/api/text", (req, res) => {
  res.send("Hello World!");
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;