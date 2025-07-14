const { customDemoText } = require("../data");
const knex = require("./client");
const { nanoid } = require("nanoid");

const addNote = async (title, text, userId) => {
  const newNote = {
    id: nanoid(),
    title,
    text,
    user_id: userId,
  };

  const inserted = await knex("notes").insert(newNote).returning("*");
  return inserted[0];
};

const getAllNotes = async (userId, { isArchived = false, filter = 7, page = 1, search = "" }, limit = 5) => {
  const baseConditions = { user_id: userId, isArchived };

  const query = knex("notes").select().where(baseConditions);
  const countQuery = knex("notes").where(baseConditions);

  if (search) {
    query.andWhere("title", "ILIKE", `%${search}%`);
    countQuery.andWhere("title", "ILIKE", `%${search}%`);
  }

  if (!isArchived && filter > 0) {
    const interval = knex.raw(`CURRENT_DATE - INTERVAL '${filter} days'`);
    query.andWhere("created_at", ">=", interval);
    countQuery.andWhere("created_at", ">=", interval);
  }

  query.orderBy("updated_at", "desc");

  const offset = (page - 1) * limit;
  const notes = await query.limit(limit).offset(offset);

  const [{ count }] = await countQuery.clone().count();
  const total = parseInt(count, 10);
  const hasMore = offset + notes.length < total;
  return { notes, hasMore };
};

const getNote = async (id) =>
  await knex("notes")
    .select()
    .where({ id })
    .limit(1)
    .then((results) => results[0]);

const changeArchiveStatus = async (id, isArchived) =>
  await knex("notes").where({ id }).update({ isArchived, updated_at: new Date() });

const editNote = async (id, title, text) =>
  await knex("notes")
    .where({ id })
    .update({ title, text, updated_at: new Date() })
    .returning("*")
    .then((results) => results[0]);

const deleteNote = async (id) => await knex("notes").where({ id }).delete();

const deleteAllArchivedNotes = async (userId) =>
  await knex("notes").where({ user_id: userId, isArchived: true }).delete();

const addUserWithDemoNote = async (userId, username) => {
  await addNote("Demo", customDemoText(username), userId);
};

module.exports = {
  addNote,
  getAllNotes,
  getNote,
  changeArchiveStatus,
  editNote,
  deleteNote,
  deleteAllArchivedNotes,
  addUserWithDemoNote,
};
