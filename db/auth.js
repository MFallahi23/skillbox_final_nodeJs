const knex = require("./client");
const { nanoid } = require("nanoid");
const { addUserWithDemoNote } = require("./notes");
const { SESSION_EXPIRATION_TIME } = require("../data");

const findUserByUsername = async (username) =>
  knex("users")
    .select()
    .where({ username })
    .limit(1)
    .then((results) => results[0]);

const findUserBySessionId = async (sessionId) => {
  const session = await knex("sessions")
    .select()
    .where({ session_id: sessionId })
    .limit(1)
    .then((results) => results[0]);

  if (!session) {
    return;
  }

  return knex("users")
    .select()
    .where({ id: session.user_id })
    .limit(1)
    .then((results) => results[0]);
};

const addUser = async (username, password) => {
  const newUser = {
    id: nanoid(),
    username,
    password,
  };
  const inserted = await knex("users").insert(newUser).returning("*");
  await addUserWithDemoNote(newUser.id, username);
  return inserted[0];
};

const createSession = async (userId) => {
  const sessionId = nanoid();
  const newSession = {
    user_id: userId,
    session_id: sessionId,
    expires_at: new Date(Date.now() + SESSION_EXPIRATION_TIME),
  };

  await knex("sessions").insert(newSession).returning("*");

  return sessionId;
};

const deleteSession = async (sessionId) => await knex("sessions").where({ session_id: sessionId }).delete();

const checkIfSessionExpired = async (sessionId) => {
  const session = await knex("sessions").where({ session_id: sessionId }).first();

  if (!session) {
    return true;
  }
  return new Date() > new Date(session.expires_at);
};

module.exports = {
  findUserBySessionId,
  findUserByUsername,
  addUser,
  createSession,
  deleteSession,
  checkIfSessionExpired,
};
