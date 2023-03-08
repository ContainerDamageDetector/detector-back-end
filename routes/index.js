import express from "express";

const router = express.Router()

router.get('/', (req, res)=> res.send("welcome"))


export default router