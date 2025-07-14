const notFoundHandler = (req, res, next) => {
  if (req.accepts("html")) {
    return res.status(404).render("404");
  } else if (req.accepts("json")) {
    return res.status(404).json({ error: "Не найдена" });
  } else {
    return res.status(404).type("txt").send("Не найдена");
  }
};

module.exports = notFoundHandler;
