import express from "express";
import { v4 as uuidv4 } from "uuid";
import models from "../models";
const config = require("../config");
import { validateToken } from "../middlewares/auth";
const AWS = require("aws-sdk");
const { Image } = require("../models");

const router = express.Router();
const {default: axios} = require('axios-https-proxy-fix');
// const axios = require('axios/dist/browser/axios.cjs');
const fileUpload = require("express-fileupload");
router.use(fileUpload());

router.get("/damageList", async (req, res) => {
  try {
      const images = await models.Image.findAll({ 
      attributes: ['title','imageUrl','damage_type', 'severity', 'recover_price'],

    });
    
    res.status(200).json(images);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

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

// createImage------

router.post("/",  async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    // if (!userId) throw new Error("Unauthenticated User");
    // const isValid = models.Image.isValid({
    //   title,
    //   imageUrl,
    // });
    // if (!isValid) throw new Error("Invalid Data");

    const s3Url = imageUrl.replace(
      `https://${config.awsConfig.bucket}.s3.amazonaws.com`,
      `s3://${config.awsConfig.bucket}`
    );

    // const predictionData_damageType = await axios
    //   .post(config.predictionServerUrl, `url=${s3Url}`)
    //   .then((res) => res.data);

    const image = await models.Image.create({
      title,
      imageUrl,
      UserId: 1,
      damage_type: 'cut',  //predictionData_damageType,
      severity: "severe",
      recover_price: 10,
    });

    res.status(200).json({
      image
    });

  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/getPresignedUrl", async (req, res) => {
  try {
    const type = req.query.type || "modelimage";
    const data = awsTypeData[type];

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

    const signedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

    res.status(200).json({
      message: "Presigned URL created",
      signedUrl: signedUrl,
      imageUrl: `https://${config.awsConfig.bucket}.s3.amazonaws.com/uploads/${data.folderName}${randomId}.${data.extension}`,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/:id", validateToken, async (req, res) => {
  try {
    const image = await models.Image.findByPk(req.params.id);
    res.status(200).json({ data: image });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const awsTypeData = {
  modelimage: {
    fileType: "image/jpeg",
    extension: "jpg",
    folderName: "images",
  },
};

export default router;
