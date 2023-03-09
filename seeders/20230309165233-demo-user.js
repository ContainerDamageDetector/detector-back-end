"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [
      {
        username: "admin_2",
        fullName: "Admin_2 User",
        email: "admin_2@gmail.com",
        passwordHash: await bcrypt.hash("Password@123", 10),
        roles: ["ADMINISTRATOR"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
