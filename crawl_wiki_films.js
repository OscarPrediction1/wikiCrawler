var crawler = require('./app/crawler');
var connection = require('./app/db');
var log = require('./app/log');
var saveViews = require('./app/save_views');

connection.query('SELECT * FROM wiki_films', function(err, rows) {
	if (err) {
		log.log('error', err);
		return;
	}
	
	for (var i in rows) {
		var film = rows[i];
		crawler.crawlFilm(film, saveViews);
	}
});

