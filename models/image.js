"use strict";

const { Model } = require("sequelize");
const yup = require("yup");

const schema = yup.object().shape({
  // imageUrl: yup.string().url().required(),
});

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    // static isValid = Image.validateImageData({
    //   imageUrl,
    // });
    // static validateImageData(data) {
    //   return schema.isValidSync(data);
    // }
    // static associate(models) {
    //   Image.belongsTo(models.User);
    // }

    toImageJson() {
      const imageJson = this.toJSON();
      return imageJson;
    }

  }
  Image.init(
    {
      title: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
      damage_type: DataTypes.STRING,
      severity: DataTypes.STRING,
      recover_price: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "Image",
    }
  );
  return Image;
};
