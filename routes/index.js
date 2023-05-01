import express from "express";

const router = express.Router()

router.get('/', (req, res)=> res.send("welcome"))

// sub-router for handling authentication related routes to the main router
router.use('/auth', require("./auth").default)

// sub-router for handling user-related routes to the main router
router.use('/user', require("./user").default)

// sub-router for handling image-related routes to the main router
router.use('/image', require("./image").default)

export default router