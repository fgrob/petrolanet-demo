require("dotenv").config();

module.exports = {
  development: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
    migrationStorageTableName: 'sequelize_meta',
  },
  production: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "postgres",
    migrationStorageTableName: 'sequelize_meta',
  },
};