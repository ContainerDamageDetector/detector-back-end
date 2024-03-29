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
    const tokens = user.generateTokens();
    res.cookie("token", tokens.accessToken);
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

router.post("/changePassword", async (req, res) => {
  try {
    const { id, password } = req.body;
    const user = await models.User.findOne({
      where: { id },
    });
    if (!user) throw new Error("Invalid User");
    const isValid = models.User.validatePassword(password);
    if (!isValid) throw new Error("Invalid Data");
    user.set({
      passwordHash: await models.User.hashPassword(password),
    });
    await user.save();
    res.status(200).json(user.toUserJson());
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// router.post("/forgotPassword", async (req, res) => {
//   try {
// 	const {} = req.body;
//     const user = await User.findOne({ where: { email } });
//     const guid = uuidv4();
//     const code = customAlphabet("1234567890", 6)();
//     await VerificationCodeHolder.create({
//       verificationCode: code,
//       guid: guid,
//       userID: user.id,
//     });
//     const msg = {
//       to: email,
//       from: "@gmail.com",
//       subject: `Forgot your password? Don't worry...`,
//       html: `<html><body><h1>Forgot your password?</h1><p>That\'s okay, it happens! use ${code} code to reset your password</p></body></html>`,
//     };
//     await sgMail.send(msg);
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// });

// router.post("/forgotPassword", async (req, res) => {
//   try {
// 	const user = await User.findOne({ where: { email } });
//     const guid = uuidv4()
//     const code = customAlphabet('1234567890', 6)()
//     await VerificationCodeHolder.create({
//       verificationCode: code,
//       guid: guid,
//       userID: user.id
//     })
//     const msg = {
//       to: email,
//       from: 'test@gmail.com',
//       subject: `Forgot your password? Don't worry...`,
//       html: `<html><body><h1>Forgot your password?</h1><p>That\'s okay, it happens! use ${code} code to reset your password</p></body></html>`,
//     }
//     await sgMail.send(msg)
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// });

// router.get("/checkVerification", async (req, res) => {
// 	try {
// 	  const verificationCode = await VerificationCodeHolder.findOne({
// 		where: {
// 		  verificationCode: guid,
// 		},
// 	  });
// 	  if (!verificationCode) {
// 		throw new Error("Invalid Verification code");
// 	  }
// 	  return verificationCode;
// 	} catch (error) {
// 	  res.status(400).send(error.message);
// 	}
//   });

//   router.post("/resetPassword", async(req,res) => {
// 	try{
// 		const verificationCode = await this.checkVerification(guid)
// 		console.log(verificationCode.toJSON())
// 		const user = await User.findByPk(verificationCode.userID);
// 		if (!user) throw new Error("User does not exist");
// 		const validPassword = await User.validatePassword(newPassword);
// 		if (!validPassword) throw new Error("Not a valid password");
// 		user.passwordHash = await User.hashPassword(newPassword);
// 		console.log(user.toJSON())
// 		await user.save();
// 		console.log(user.toJSON())
// 		await verificationCode.destroy();
// 	}catch(error){
// 		res.status(400).send(error.message);
// 	}
//   })

export default router;
