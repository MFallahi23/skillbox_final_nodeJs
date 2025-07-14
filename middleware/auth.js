const { findUserBySessionId, checkIfSessionExpired } = require("../db/auth");

const auth = async (req, res, next) => {
  if (!req.cookies["sessionId"]) {
    return next();
  }

  try {
    const sessionId = req.cookies["sessionId"];

    const isExpired = await checkIfSessionExpired(sessionId);
    if (isExpired) {
      res.clearCookie("sessionId");
      return next();
    }
    const user = await findUserBySessionId(sessionId);

    if (!user) {
      res.clearCookie("sessionId");
      return next();
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { auth };
