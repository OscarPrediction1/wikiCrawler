var appDir = './app/';
var CatCrawler = require(appDir + 'categoryCrawler');
var config = require(appDir + 'config');
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');

var years = [];

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
		if (arg === 'crawl-films') {
			crawlFilms(db);
		}
	});
}

function getOption(db, key) {
	var defered = Q.defer();
	db.collection('wiki_options').findOne({'key': key}, function(err, result) {
		if (err) {
			console.log("Can't connect to DB!", err);
			defered.reject(err);
			return;
		}
		
		defered.resolve(result.value);
	});
	return defered.promise;
}

function crawlFilms(db) {
	var date = new Date();
	var currentYear = date.getFullYear();
	
	//TODO: Entferne die Filme aus dem currentYear, damit neue geparst werden können
	
	Q.all([getOption(db, 'firstYearToParse'), getOption(db, 'parsedYears')]).then(function(options) {
		var firstYearToParse = options[0];
		var parsedYears = options[1];
		
		for (var year = firstYearToParse; year < currentYear; year++) {
			if (parsedYears.indexOf(year) === -1) {
				console.log('Start crawling ' + year);
				years.push(crawlYear(db, year));
			}
		}
			
		//CurrentYear wird immer geparst, da es sich regelmäßig ändert
		years.push(crawlYear(db, currentYear));
		Q.all(years).then(function() {
			console.log('Closing DB-Connection');
			db.close();
		});
	});
}

function crawlYear(db, year) {
	return deleteYear(db, year).then(function() {
		var catCrawler = new CatCrawler(db, year);
		return catCrawler.start();
	});
}

function deleteFilms(db, year) {	
	var defered = Q.defer();
	db.collection('wiki_films').remove({'year': year}, function(err, result) {
		if (err) {
			console.log("Can't connect to DB!", err);
			defered.reject(err);
			return;
		}
		defered.resolve(result);
	});
	return defered.promise;
}

function deleteParsedYearOption(db, year) {
	var defered = Q.defer();
	db.collection('wiki_options').update({'key': 'parsedYears'}, {$pull: {'value': this.year}}, function(err) {
		if (err) {
			console.log(err);
			defered.reject(err);
			return;
		}
		defered.resolve();
	});
	return defered.promise;
}

function deleteYear(db, year, callback) {
	return deleteFilms(db, year).then(function() {
		return deleteParsedYearOption(db, year);
	});
}