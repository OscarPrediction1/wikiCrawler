var appDir = './app/';
var Films = require(appDir + 'films');
var config = require(appDir + 'config');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(config.mongodb.uri, function(err, db) {
	if (err) {
		console.log("Can't connect to DB!");
		return;
	}
	
	parseArguments(db);
});

function parseArguments(db) {
	var args = process.argv.slice(2); //Ersten beiden sind rubbish
	args.forEach(function(arg) {
		if (arg === 'films') {
			crawlFilms(db);
		}
	});
}

function getOption(db, key, callback) {
	db.collection('wiki_options').findOne({'key': key}, function(err, result) {
		if (err) {
			console.log("Can't connect to DB!");
			return;
		}
		
		callback(result.value);
	});
}

function crawlFilms(db) {
	var date = new Date();
	var currentYear = date.getFullYear();
	
	//TODO: Entferne die Filme aus dem currentYear, damit neue geparst werden können
	
	getOption(db, 'firstYearToParse', function(firstYearToParse) {
		getOption(db, 'parsedYears', function(parsedYears) {
		    for (var year = firstYearToParse; year < currentYear; year++) {
				if (parsedYears.indexOf(year) === -1) {
					crawlYear(db, year);
				}
			}
			
			//CurrentYear wird immer geparst, da es sich regelmäßig ändert
			crawlYear(db, currentYear);
		});
	});
}

function crawlYear(db, year) {
	deleteYear(db, year, function() {
		var films = new Films(db);
		films.start(year);
	});
}

function deleteYear(db, year, callback) {
	db.collection('wiki_films').remove({'year': year}, function(err, result) {
		if (err) {
			console.log("Can't connect to DB!");
			return;
		}
		
		callback();
	});
}
