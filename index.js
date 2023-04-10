const path = require('path');
const express = require("express");
const serverless = require('serverless-http')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// global.fetch = require('node-fetch');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json({
  limit: '1mb'
}));
app.use(cookieParser());

app.use('/api', require('./routes/index').default);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.all('*', function(req, res) {
  const response = { data: null, message: 'Route not found!!' }
  res.status(400).send(response)
})

module.exports.handler = serverless(app)