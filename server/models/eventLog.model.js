module.exports = (sequelize, Sequelize) => {
  const EventLog = sequelize.define("EventLog", {
    operation_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    user: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    tank_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    transaction_quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    balance: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    measured_balance: {
      type: Sequelize.INTEGER,
    },
    error_quantity: {
      type: Sequelize.INTEGER,
    },
    tank_number_to_date: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    document_type: {
      type: Sequelize.STRING(20),
    },
    document_number: {
      type: Sequelize.INTEGER,
    },
    client_id: {
      type: Sequelize.INTEGER,
    },
    supplier_id: {
      type: Sequelize.INTEGER,
    },
    notes: {
      type: Sequelize.TEXT,
    },
    tank_number_variation: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  });

  EventLog.belongsTo(sequelize.models.Operation, {
    foreignKey: "operation_id",
    as: "operation",
  });
  EventLog.belongsTo(sequelize.models.Tank, {
    foreignKey: "tank_id",
    as: "tank",
  });
  EventLog.belongsTo(sequelize.models.Client, {
    foreignKey: "client_id",
    as: "client",
  });
  EventLog.belongsTo(sequelize.models.Supplier, {
    foreignKey: "supplier_id",
    as: "supplier",
  });

  return EventLog;
};
