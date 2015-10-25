var url = require('url');
var request = require('request');

function CatCrawler(db, year) {
	this.year = year;
	this.db = db;
	this.url = {
		protocol: 'https:',
		host: 'en.wikipedia.org',
		hostname: 'en.wikipedia.org',
		query: { 
			action: 'query',
			list: 'categorymembers',
			cmtitle: 'Category:' + year + '_films',
			cmlimit: 'max',
			format: 'json'
		},
		pathname: '/w/api.php',
	};
};

CatCrawler.prototype.start = function() {
	this.crawl();	
};

CatCrawler.prototype.crawl = function(cursor) {
	var self = this;
	var crawlUrl = this.url;
	
	if (cursor) {
		crawlUrl.query.cmcontinue = cursor;
	}
	
	crawlUrl = url.format(crawlUrl);
	
	request(crawlUrl, function(err, res, body) {
		if (err) {
			console.log(crawlUrl + ' nicht erreichbar');
			return;
		}
		
		var result = JSON.parse(body);
		var films = result.query.categorymembers;
		
		if (result.continue && result.continue.cmcontinue) {
			self.crawl(result.continue.cmcontinue);
		} else {
			console.log(self.year + ' completed');
			self.yearComplete();
		}
		
		films = films.map(function(film) {
			film.year = self.year;
			return film;
		});
		
		self.write(films);
	});
};

CatCrawler.prototype.write = function(data) {
	this.db.collection('wiki_films').insert(data);
};

CatCrawler.prototype.yearComplete = function() {
	this.db.collection('wiki_options').update({'key': 'parsedYears'}, {$push: {'value': this.year}});
};

module.exports = CatCrawler;