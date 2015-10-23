var appDir = './app/';
var db = require(appDir + 'database');
var Films = require(appDir + 'films');
var config = require(appDir + "config");
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(config.mongodb.uri, function(err, db) {
	if (err) {
		console.log("Can't connect to DB!")
		return;
	}
	
	parseArguments(db);
});

function parseArguments(db) {
	var args = process.argv.slice(2); //Ersten beiden sind rubbish
	args.forEach(function(arg) {
		if (arg === 'films') {
			var films = new Films(db);
			films.start(2014);
		}
	});
}