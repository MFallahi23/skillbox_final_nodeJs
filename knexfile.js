require("dotenv").config();

module.exports = {
  client: "pg",
  connection: {
    connectionString: process.env.NEON_DB_URL,
    ssl: false,
  },
  migrations: {
    tableName: "knex_migrations",
  },
};
