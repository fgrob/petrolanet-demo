'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('OriginalEventsBackups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      original_event_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      operation_id: {
        type: Sequelize.INTEGER,
      },
      user: {
        type: Sequelize.STRING(20),
      },
      tank_id: {
        type: Sequelize.INTEGER,
      },
      transaction_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      balance: {
        type: Sequelize.INTEGER,
      },
      measured_balance: {
        type: Sequelize.INTEGER,
      },
      error_quantity: {
        type: Sequelize.INTEGER,
      },
      tank_number_to_date: {
        type: Sequelize.INTEGER,
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
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('OriginalEventsBackups');
  }
};
