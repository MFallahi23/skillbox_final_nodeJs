const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500);

  if (req.accepts("json")) {
    res.json({ error: "Internal server error" });
  } else {
    res.type("txt").send("Internal server error");
  }
};

module.exports = errorHandler;
