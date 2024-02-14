module.exports = (sequelize, Sequelize) => {
  const Tank = sequelize.define("Tank", {
    type: {
      type: Sequelize.ENUM("ESTANQUE", "ESTANQUE MOVIL", "CAMION"),
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    current_quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    measured_quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    error_quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tank_gauge: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    tank_number: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    tank_speed: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: Sequelize.ENUM(
        "DISPONIBLE",
        "NO DISPONIBLE",
        "EN CARGA",
        "CARGA EN PAUSA",
        "EN DESCARGA",
        "DESHABILITADO"
      ),
      defaultValue: "DISPONIBLE",
    },
    timestamp_current_quantity: {
      type: Sequelize.DATE,
    },
    timestamp_measured_quantity: {
      type: Sequelize.DATE,
    },
    timestamp_check_tank_number: {
      type: Sequelize.DATE,
    },
  });

  return Tank;
};
