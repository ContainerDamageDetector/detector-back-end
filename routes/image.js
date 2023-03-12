import express from "express";
import models from "../models";
const config = require('../config')
import { validateToken } from "../middlewares/auth";

const router = express.Router();

router.get("/imgall", async (req, res) => {
	try {
        const images = await models.Image.findAll({ include: { all: true } });
		res.status(200).json(images)
	} catch (error) {
		res.status(400).send(error.message);
	}
});

router.get("/:id", validateToken, async (req, res) => {
	try {
		const image = await  models.Image.findByPk(req.params.id)
		res.status(200).json({ data: image })
	} catch (error) {
		res.status(400).send(error.message)
	}
});

router.get("/getImageByUser", async (req, res) => {
	try {
        const images = await models.Image.findAll();
		res.status(200).json(images)
	} catch (error) {
		res.status(400).send(error.message);
	}
});

export default router;