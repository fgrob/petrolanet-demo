module.exports = (sequelize, Sequelize) => {
  const Operation = sequelize.define("Operation", {
    name: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    },
  });

  return Operation;
};

// 1: COMPRA
// 2: VENTA
// 3: TRASPASO
// 4: AJUSTE
// 5: MEDICION
// 6: REVISION
