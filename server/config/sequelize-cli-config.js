require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
    migrationStorageTableName: 'sequelize_meta',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
    migrationStorageTableName: 'sequelize_meta',
  },
};