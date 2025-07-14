const express = require("express");
const nunjucks = require("nunjucks");
const knex = require("./db/client");
const authRouter = require("./routes/auth");
const notesRouter = require("./routes/notes");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const helmet = require("helmet");
const morgan = require("morgan");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();
const app = express();

knex
  .raw("SELECT 1")
  .then(() => {
    console.log("✅ Connected to Neon PostgreSQL successfully!");
  })
  .catch((err) => {
    console.error("❌ Failed to connect to Neon PostgreSQL:", err);
  });

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "*"],
        styleSrc: ["'self'", "'unsafe-inline'", "*"],
        fontSrc: ["*"],
        imgSrc: ["*", "data:"],
      },
    },
  }),
);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRouter);
app.use("/notes", auth, notesRouter);

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV === "development",
  noCache: process.env.NODE_ENV === "development",
});

app.set("view engine", "njk");

app.get("/", auth, (req, res) => {
  if (!req.user) {
    res.render("index", {
      authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
    });
  } else {
    res.redirect("/dashboard");
  }
});

app.get("/dashboard", auth, (req, res) => {
  if (req.user) {
    res.render("dashboard", {
      user: req.user,
    });
  } else {
    res.redirect("/");
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("unhadled Promise:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("unhandled exception:", err);
  process.exit(1);
});
