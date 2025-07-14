const bcryptjs = require("bcryptjs");
const { addUser, createSession, findUserByUsername, deleteSession, findUserById } = require("../db/auth");
const { SESSION_EXPIRATION_TIME } = require("../data");
require("dotenv").config();
const { validationResult } = require("express-validator");

const SALT_ROUNDS = 10;

const handleSignup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).redirect("/?authError=true");
  }
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
    const newUser = await addUser(username, hashedPassword);
    const sessionId = await createSession(newUser.id);

    res
      .cookie("sessionId", sessionId, {
        httpOnly: true,
        maxAge: SESSION_EXPIRATION_TIME,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .redirect("/dashboard");
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).redirect("/?authError=true");
    }
    console.error("Signup error:", error);
    res.status(500).send("Server error");
  }
};

const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).redirect("/?authError=true");
  }

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.redirect("/?authError=true");
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.redirect("/?authError=true");
    }

    const sessionId = await createSession(user.id);

    res
      .cookie("sessionId", sessionId, {
        httpOnly: true,
        maxAge: SESSION_EXPIRATION_TIME,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Server error");
  }
};

const handleLogout = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.redirect("/");
  }

  try {
    await deleteSession(req.sessionId);
    res
      .clearCookie("sessionId", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" })
      .redirect("/");
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send("Server error");
  }
};

module.exports = { handleLogin, handleSignup, handleLogout };
