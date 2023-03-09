import express from "express";
import config from "../config";
import models from "../models";

const router = express.Router();

router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await models.User.findOne({ where: { username } });
		if (!user) throw new Error("Incorrect Username or Password");
		const validPassword = await user.comparePassword(password);
		if (!validPassword) throw new Error("Incorrect Username or Password");
		const tokens = user.generateTokens()
		res.cookie('token', tokens.accessToken)
		res.status(200).json({
			tokens: tokens,
			user: user.toUserJson(),
		});
	} catch (error) {
		res.status(400).send(error.message);
	}
});

router.get("/logout", async (req, res) => {
	try {
		res.clearCookie("token");
		res.status(200).send("User Logged Out");
	} catch (error) {
		res.status(400).send(error.message);
	}
});

export default router;