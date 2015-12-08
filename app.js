var crawler = require('./app/crawler');
var connection = require('./app/db');
var log = require('./app/log');
var saveViews = require('./app/save_views');
var argv = require('yargs')
	.usage('Usage: app.js <command> [options]')
    .command('all', 'Crawl views for all films from wiki_films db. No further arguments needed')
	.command('film', 'Only crawl a specific film')
    .demand(1)
	.describe('boxOfficeId', 'BoxOfficeId of film')
	.describe('year', 'Year to crawl')
	.describe('month', 'Month to crawl. --year must be specified')
	.describe('url', 'stats.grok.se url to crawl')
    .example('app.js film -boxOfficeId birdman -year 2014 -month 1', 'Crawl 2014-01 views of birdman')
	.example('app.js film -boxOfficeId australia -url "http://stats.grok.se/json/en/200905/Australia (2008 film)"', 'Crawl 2009-05 views of australia')
    .argv;

var firstArg = argv._[0];
if (firstArg === 'all') {
	all();
}

if (firstArg === 'film') {
	film();
}

function all() {
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
}

function film() {
	var boxOfficeId = argv.boxOfficeId;
	
	connection.query('SELECT * FROM wiki_films WHERE boxOfficeId = ?', [boxOfficeId], function(err, rows) {
		if (err) {
			log.log('error', err);
			return;
		}
		
		var film = rows[0];
		
		if (argv.year && argv.month) {
			console.log('month');
			crawler.crawlMonth(film, argv.year, argv.month, saveViews);
			return;
		}
		
		if (argv.year) {
			console.log('year');
			crawler.crawlYear(film, argv.year, saveViews);
			return;
		}
		
		if (argv.url) {
			console.log('url');
			crawler.crawlUrl(film, argv.url, saveViews);
			return;
		}
		
		crawler.crawlFilm(film, saveViews);
	});
}