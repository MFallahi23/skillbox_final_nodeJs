const express = require("express");
const { handleSignup, handleLogin, handleLogout } = require("../controllers/auth");
const { auth } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many attempts, try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/auth/test", (req, res) => {
  res.send("Working");
});

router.post(
  "/signup",
  authLimiter,
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("password").isLength({ min: 3 }).withMessage("Password must be at least 3 characters"),
  ],
  handleSignup,
);

router.post("/login", authLimiter, handleLogin);

router.get("/logout", auth, handleLogout);

module.exports = router;
