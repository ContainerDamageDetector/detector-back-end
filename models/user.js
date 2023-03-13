"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const yup = require("yup");

const config = require("../config");

const schema = yup.object().shape({
  username: yup.string().required(),
  fullName: yup.string().required(),
  email: yup.string().email().required(),
  password: yup
    .string()
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/
    ),
  roles: yup.array().of(yup.string()),
});

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static validateUserData(data, withoutPassword) {
      if (withoutPassword) return schema.omit(["password"]).isValidSync(data);
      return schema.isValidSync(data);
    }

    static validatePassword(password) {
      return yup.reach(schema, "password").isValidSync(password);
    }

    static hashPassword(password) {
      return bcrypt.hash(password, 10);
    }

    comparePassword(password) {
      return bcrypt.compare(password, this.passwordHash);
    }

    generateTokens() {
      let payload = {
        id: this.id,
        username: this.username,
        roles: this.roles,
      };
      let accessToken = jwt.sign(payload, config.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: config.ACCESS_TOKEN_LIFE,
      });
      let refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: config.REFRESH_TOKEN_LIFE,
      });
      return {
        accessToken,
        refreshToken,
      };
    }

    toUserJson() {
      const userJson = this.toJSON();
      delete userJson.passwordHash;
      return userJson;
    }

    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      fullName: DataTypes.STRING,
      email: DataTypes.STRING,
      passwordHash: DataTypes.STRING,
      roles: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
