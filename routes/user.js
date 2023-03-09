import express from "express";
import { validateToken } from "../middlewares/auth";
import models from "../models";

const router = express.Router();

router.get("/all", async (req, res) => {
	try {
        const users = await models.User.findAll({ include: { all: true } });
		res.status(200).json(users.map(user=>user.toUserJson()));
	} catch (error) {
		res.status(400).send(error.message);
	}
});

router.post("/create", async (req, res) => {
	try {
		const { username, fullName, email, password, roles } = req.body;

        const isValid = models.User.validateUserData({
            username,
			fullName,
			email,
			password,
			roles,
		});
        if (!isValid) throw new Error("Invalid Data");
        const user = await models.User.create({
            username,
			fullName,
			email,
			roles,
			passwordHash: await models.User.hashPassword(password),
		});
		res.status(200).json(user.toUserJson());
	} catch (error) {
		res.status(400).send(error.message);
	}
});

export default router;