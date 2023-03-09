import express from "express";

const router = express.Router()

router.get('/', (req, res)=> res.send("welcome"))
router.use('/auth', require("./auth").default)
router.use('/user', require("./user").default)


export default router