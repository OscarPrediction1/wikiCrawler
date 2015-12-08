var request = require('request');
var _ = require('lodash');
var log = require('./log');

function crawlFilm(film, callback) {
	for (var year = 2008; year <= 2014; year++) {
		crawlYear(film, year, callback);
	}
}

function crawlYear(film, year, callback) {
	for (var month = 1; month <= 12; month++) {
		crawlMonth(film, year, month, callback);
	}
}

function crawlMonth(film, year, month, callback) {
	var statsUrl = 'http://stats.grok.se/json/en/';
	if (month.toString().length !== 2) {
		month = '0' + month;
	}
	statsUrl += year.toString() + month.toString() + '/' + film.title;
	
	crawlUrl(film, statsUrl, callback);
}

function crawlUrl(film, statsUrl, callback) {
	request(statsUrl, function(err, res, body) {
		if (err) {
			log.log('error', statsUrl + ' nicht erreichbar');
			return;
		}
		
		try {
			var result = JSON.parse(body);
		} catch (e) {
			log.log('error', e);
			log.log('error', "in " + statsUrl);
			return;
		}
		
		var views = result.daily_views;
		
		callback(film, views, statsUrl);
	});
}

module.exports = {
		crawlFilm: crawlFilm,
		crawlYear: crawlYear,
		crawlMonth: crawlMonth,
		crawlUrl: crawlUrl
};