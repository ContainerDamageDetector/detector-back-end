const jwt = require('jsonwebtoken');
const config = require('../config')

const validateToken = async (req, res, next) => {
    let accessToken = req.cookies.token
    if (!accessToken)
        return res.status(403).send()
    try {
        const payload = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET)
        req.user = payload
        next()
    }
    catch (e) {
        return res.status(401).send()
    }
}

module.exports = {
    validateToken: validateToken
}