var express = require('express');
var router = express.Router();
var {database} = require('./signin');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(database)
});

module.exports = router;
