var appDir = './app/';
var Films = require(appDir + 'films');
var config = require(appDir + 'config');
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
			crawlYears(db);
		}
	});
}

function crawlYears(db) {
	var date = new Date();
	var currentYear = date.getFullYear();
	var voteableYear = currentYear - 1;
	var firstYearToParse;
	var parsedYears;
	
	db.collection('wiki_options').findOne({'key': 'firstYearToParse'}, function(err, result) {
		if (err) {
			console.log("Can't connect to DB!")
			return;
		}
		
		firstYearToParse = result.value;
		
		db.collection('wiki_options').findOne({'key': 'parsedYears'}, function(err, result) {
			if (err) {
				console.log("Can't connect to DB!")
				return;
			}
			
			parsedYears = result.value;
			
			for (var year = firstYearToParse; year <= voteableYear; year++) {
				if (parsedYears.indexOf(year) === -1) {
					var films = new Films(db);
					films.start(year);
				}
			}
			
		});
	});
}