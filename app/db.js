var mysql = require('mysql');
var config = require('./config.js');
var log = require('./log');

var connection = mysql.createConnection(config.mysql);
connection.connect(function(err) {
	if (err) {
		log.log('error', err);
	}
});
module.exports = connection;