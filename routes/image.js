import express from "express";
import { v4 as uuidv4 } from 'uuid';

import models from "../models";
const config = require("../config");
import { validateToken } from "../middlewares/auth";
import multer from "multer";
import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
const AWS = require("aws-sdk");

const router = express.Router();
const fileUpload = require("express-fileupload");

router.use(fileUpload());



dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESSS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKey: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single("avatar");

router.get("/imgall1", async (req, res) => {
  try {
    const images = await models.Image.findAll({ include: { all: true } });
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

router.post("/", async (req, res) => {
  console.log("req.body", req.body);
  res.send({});
  const s3Url = imageUrl.replace(
    `https://${config.awsConfig.bucket}.s3.amazonaws.com`,
    `s3://${config.awsConfig.bucket}`
  );

  // AWS.config.update({
  // 		accessKeyId: `${config.awsConfig.key}`,
  // 		secretAccessKey: `${config.awsConfig.secret}`,
  // 		region: `${config.awsConfig.region}`
  // 	})

  // 	const s3 = new AWS.S3();
  // 	const fileContent = Buffer.from("file", 'binary');
  // 	const params = {
  // 		Bucket: `${config.awsConfig.bucket}`,
  // 		Key: req.files.data.name,
  // 		Body: fileContent
  // 	}

  // 	s3.upload(params, (err,data) => {
  // 		if(err){
  // 			throw err;
  // 		}
  // 		res.send({
  // 			"response_code" : 200,
  // 			"response_message" : "Image created successfully",
  // 			"response_data" : data

  // 		});
  // 	})

  // try{
  // AWS.config.update({
  // 	accessKeyId: 'AKIA5OSYVVF3F5WPQHEY',
  // 	secretAccessKey: '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',
  // 	region: 'ap-south-1'
  // })

  // const s3 = new AWS.S3();
  // const fileContent = Buffer.from(req.files.data.data, 'binary');
  // const params = {
  // 	Bucket: 'container-damage-detector',
  // 	Key: req.files.data.name,
  // 	Body: fileContent
  // }

  // s3.upload(params, (err,data) => {
  // 	if(err){
  // 		throw err;
  // 	}
  // 	res.send({
  // 		"response_code" : 200,
  // 		"response_message" : "Image created successfully",
  // 		"response_data" : data

  // 	});
  // })

  // console.log('req.body', req.body)
  // res.send({})
  // const image = await models.Image.createImage(req.body, req.user.id)
  // res.status(201).json({
  // 	message: "Image created successfully",
  // 	data: image
  // })
  // }catch(error){
  // 	res.status(400).send(error.message)
  // }
});

router.get('/getPresignedUrl', async (req, res) => {
  try {
    const type = req.query.type || 'modelimage';
    const data = awsTypeData[type];

    const s3 = new AWS.S3({
      accessKeyId: config.awsConfig.key,
      secretAccessKey: config.awsConfig.secret,
      region: config.awsConfig.region,
      apiVersion: '2006-03-01',
      signatureVersion: 'v4',
    });

    const randomId = uuidv4();

    const s3Params = {
      Bucket: config.awsConfig.bucket ,
      Key: `uploads/${data.folderName}/${randomId}.${data.extension}`,
      Expires: 240, // URL expiration time in seconds
      ContentType: data.fileType,
      ACL: "public-read", 
    };

    const signedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

    res.status(200).json({
      message: 'Presigned URL created',
      signedUrl: signedUrl,
      imageUrl: `https://${config.awsConfig.bucket}.s3.amazonaws.com/uploads/${data.folderName}${randomId}.${data.extension}`
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
