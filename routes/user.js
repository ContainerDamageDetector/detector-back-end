import express from "express";
import { validateToken } from "../middlewares/auth";
import models from "../models";

const router = express.Router();

//retrieve all users
router.get("/all", async (req, res) => {
  try {
    const users = await models.User.findAll({ include: { all: true } });
    res.status(200).json(users.map((user) => user.toUserJson()));
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//create new user
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

//retrieve user details by user id
router.get("/:id", validateToken, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.params.id);
    res.status(200).json({ data: user.toUserJson() });
  } catch {
    res.status(400).send(error.message);
  }
});

//update user details
router.put("/updateUser", validateToken, async (req, res) => {
  try {
    const { id, username, fullName, email } = req.body;
    const user = await models.User.findOne({
      where: { id },
    });
    if (!user) throw new Error("Invalid User");
    const isValid = models.User.validateUserData({
      username,
      fullName,
      email,
    });
    if (!isValid) throw new Error("Invalid Data");
    user.set({
      username,
      fullName,
      email,
    });
    await user.save();
    res.status(200).json(user.toUserJson());

    await user.save();
    res.status(200).json(user.toUserJson());
  } catch {
    res.status(400).send(error.message);
  }
});




export default router;
