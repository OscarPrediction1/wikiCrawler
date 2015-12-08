var connection = require('./db');
var log = require('./log');

module.exports = function(film, views, statsUrl) {
	for (var date in views) {
		var view = {boxOfficeId: film.boxOfficeId, date: date, views: views[date]};
		connection.query('INSERT INTO wiki_views SET ?', view, function(err) {
			if (err) {
				log.log('error', err);
				log.log('error', statsUrl);
				log.log('error', view);
			}
		});
	}
};