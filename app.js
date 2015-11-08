var appDir = './app/';
var CatCrawler = require(appDir + 'categoryCrawler');
var ViewCrawler = require(appDir + 'viewCrawler');
var config = require(appDir + 'config');
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');

var years = [];

MongoClient.connect(config.mongodb.uri, function (err, db) {
	if (err) {
		console.log("Can't connect to DB!");
		return;
	}

	parseArguments(db);
});

function parseArguments(db) {
	var args = process.argv.slice(2); //Ersten beiden sind rubbish
	if (args.length === 0) {
		return help(db);
	}
	args.forEach(function (arg) {
		if (arg === 'crawl-films') {
			return crawlFilms(db);
		}

		if (arg === 'create-default-options') {
			return createDefaultOptions(db);
		}

		if (arg === 'crawl-views') {
			return crawlViews(db);
		}
	});
}

function help(db) {
	console.log('Wikipedia Films Crawler');
	console.log('Parameters: create-default-options, crawl-films, crawl-view-stats');
	db.close();
}

function createDefaultOptions(db) {
	updateOption(db, 'parsedYears', []).then(function () {
		return updateOption(db, 'firstYearToParse', 2000);
	}).then(function () {
		db.close();
	});
}

function crawlFilms(db) {
	var date = new Date();
	var currentYear = date.getFullYear();
	
	//TODO: Entferne die Filme aus dem currentYear, damit neue geparst werden können
	
	Q.all([getOption(db, 'firstYearToParse'), getOption(db, 'parsedYears')]).then(function (options) {
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
		Q.all(years).then(function () {
			console.log('Closing DB-Connection');
			db.close();
		});
	});
}

function crawlViews(db) {
	//TODO: Nur einzelne Jahre, in config speichern, wie weit wir sind
	var query = {year: {$gte: 2008}, views: {$exists: false}};
	// var query = {year: 2008, views: {$exists: false}};
	var cursor = db.collection('wiki_films').find(query);
	// cursor.limit(1);
	cursor.count(function(err, count) {
		var savesPending = count;

		if (count == 0) {
			db.close();
			return;
		}

		var saveFinished = function () {
			savesPending--;
			if (savesPending == 0) {
				db.close();
			}
		}

		cursor.each(function (err, res) {
			if (res != null) {
				var viewCrawler = new ViewCrawler(db, res.title, res.year, res.pageid);
				viewCrawler.start().then(function() {
					saveFinished();
				});
			}
		});
	});
}

function getOption(db, key) {
	var defered = Q.defer();
	db.collection('wiki_options').findOne({ 'key': key }, function (err, result) {
		if (err) {
			console.log("Can't connect to DB!", err);
			defered.reject(err);
			return;
		}

		defered.resolve(result.value);
	});
	return defered.promise;
}

function updateOption(db, key, value) {
	var defered = Q.defer();
	db.collection('wiki_options').update({ 'key': key }, { 'key': key, 'value': value }, { upsert: true }, function (err) {
		if (err) {
			console.log(err);
			defered.reject(err);
			return;
		}
		defered.resolve();
	});
	return defered.promise;
}

function crawlYear(db, year) {
	return deleteYear(db, year).then(function () {
		var catCrawler = new CatCrawler(db, year);
		return catCrawler.start();
	});
}

function deleteFilms(db, year) {
	var defered = Q.defer();
	db.collection('wiki_films').remove({ 'year': year }, function (err, result) {
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
	//TODO: Funktioniert, warum auch immer, noch nicht
	db.collection('wiki_options').update({ 'key': 'parsedYears' }, { $pull: { 'value': this.year } }, function (err) {
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
	return deleteFilms(db, year).then(function () {
		return deleteParsedYearOption(db, year);
	});
}