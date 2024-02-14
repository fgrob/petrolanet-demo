module.exports = (sequelize, Sequelize) => {
  const Supplier = sequelize.define("Supplier", {
    rut: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    },
    business_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    alias: {
      type: Sequelize.STRING(100),
    },
  });

  return Supplier;
};
