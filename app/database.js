var config = require("./config.js");
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(config.mongodb.uri, function(err, db) {
	console.log("Connected correctly to server.");
	db.close();
});


var database = function () {
    
}

exports = database;