const config = require("../config/db.config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.tank = require("../models/tank.model")(sequelize, Sequelize);
db.operation = require("../models/operation.model")(sequelize, Sequelize);
db.client = require("../models/client.model")(sequelize, Sequelize);
db.supplier = require("../models/supplier.model")(sequelize, Sequelize);
db.eventLog = require("../models/eventLog.model")(sequelize, Sequelize);
db.request = require("../models/request.model")(sequelize, Sequelize);
db.originaleventbackup = require("../models/originalEventsBackup.model")(
  sequelize,
  Sequelize
);

module.exports = db;
