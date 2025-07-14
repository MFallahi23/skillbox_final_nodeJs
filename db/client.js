require("dotenv").config();

const knex = require("knex")({
  client: "pg",
  connection: {
    connectionString: process.env.NEON_DB_URL,
    ssl: false,
  },
});

module.exports = knex;
