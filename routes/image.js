import express from "express";
import { v4 as uuidv4 } from "uuid";
import models from "../models";
const config = require("../config");
import { validateToken } from "../middlewares/auth";
const AWS = require("aws-sdk");
const { Image } = require("../models");
const { DataTypes } = require('sequelize');

const s3 = new AWS.S3();

const router = express.Router();
const { default: axios } = require("axios-https-proxy-fix");
const fileUpload = require("express-fileupload");
router.use(fileUpload());


//  Retrieves the list of damages
router.get("/damageList", async (req, res) => {
  try {
    const images = await models.Image.findAll({
      attributes: ['id', 'title', 'imageUrl', 'damage_type', 'severity'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(images);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Retrieves the list of recover price
router.get("/recoverPriceList", async (req, res) => {
  try {
    const images = await models.Image.findAll({
      attributes: ['id','title', 'imageUrl', 'recover_price'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(images);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Retrieves the image details by userId
router.get("/getImagesByUser", validateToken, async (req, res) => {
  try {
    const images = await models.Image.findAll({
      where: {
        UserId: req.user.id,
      },
      include: [{ all: true }],
    });
    res.status(200).json({ data: images });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Insert the uploaded image details to db
router.post("/", async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    // if (!userId) throw new Error("Unauthenticated User");
    // const isValid = models.Image.isValid({
    //   title,
    //   imageUrl,
    // });
    // if (!isValid) throw new Error("Invalid Data");

    // Replaces a string in the "imageUrl" variable to convert an Amazon S3 URL to an S3 URI.
    const s3Url = imageUrl.replace(
      `https://${config.awsConfig.bucket}.s3.amazonaws.com`,
      `s3://${config.awsConfig.bucket}`
    );

    console.log(s3Url);

    // POST request to damage type prediction server with parameter "url" response data assigned to predictionData_damageType
    const predictionData_damageType = await axios
      .post(config.damage_predictionServerUrl, `url=${s3Url}`)
      .then((res) => res.data);

    // POST request to severity prediction server with parameter "url" response data assigned to predictionData_severeType
    const predictionData_severeType = await axios
      .post(config.severity_predictionServerUrl, `url=${s3Url}`)
      .then((res) => res.data);

    // POST request to recover price prediction server with parameter "url" response data assigned to predictionData_recoverPrice
    const predictionData_recoverPrice = await axios
      .post(config.estimateRecoverPrice_predictionServerUrl, `url=${s3Url}`)
      .then((res) => res.data);

      //converts the string value to float
    const price = parseFloat(predictionData_recoverPrice.replace('[','').replace(']',''));;

    //creates a new image record in the database of Image table
    const image = await models.Image.create({
      title,
      imageUrl,
      UserId: 1, //GET user Id,
      damage_type: predictionData_damageType,
      severity: predictionData_severeType,
      recover_price: price.toFixed(2)
    });

    res.status(200).json({
      image,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//  Retrieves a pre-signed URL to upload a file to Amazon S3
router.get("/getPresignedUrl", async (req, res) => {
  try {
    const type = req.query.type || "modelimage";
    const data = awsTypeData[type];

    // AWS SDK S3 class instance with specified configuration
    const s3 = new AWS.S3({
      accessKeyId: config.awsConfig.key,
      secretAccessKey: config.awsConfig.secret,
      region: config.awsConfig.region,
      apiVersion: "2006-03-01",
      signatureVersion: "v4",
      // ACL: "public-read",
    });

    const randomId = uuidv4();

    const s3Params = {
      Bucket: config.awsConfig.bucket,
      Key: `uploads/${data.folderName}/${randomId}.${data.extension}`,
      Expires: 240, // URL expiration time in seconds
      ContentType: data.fileType,
    };

    // Defines s3Params for pre-signed URL
    const signedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

    res.status(200).json({
      message: "Presigned URL created",
      signedUrl: signedUrl,
      imageUrl: `https://${config.awsConfig.bucket}.s3.amazonaws.com/uploads/${data.folderName}/${randomId}.${data.extension}`,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//retrieve a single image record by id
router.get("/:id", async (req, res) => {
  try {
    const image = await models.Image.findByPk(req.params.id);
    res.status(200).json({ data: image });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//retrieve a file from Amazon S3 by its key
router.get("/:folder1/:folder2/:key", (req, res) => {

  const params = {
    Bucket: config.awsConfig.bucket,
    Key: `${req.params.folder1}/${req.params.folder2}/${req.params.key}`,
  };
  s3.getObject(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    }
    res.writeHead(200);
    res.end(data.Body, "binary");
  });
});

//contains information about expected image file details
const awsTypeData = {
  modelimage: {
    fileType: "image/jpeg",
    extension: "jpg",
    folderName: "images",
  },
};

export default router;