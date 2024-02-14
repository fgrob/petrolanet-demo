'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Tanks', 'timestamp_check_tank_number', {
      type: Sequelize.DATE,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tanks', 'timestamp_check_tank_number');
  }
};
