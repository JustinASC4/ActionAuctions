var express = require('express');
var router = express.Router();
var tools = require('../tools');

router.get('/', function(req, res){
	tools.notify_winner('abcdef');
	res.redirect('/');
});

module.exports = router;