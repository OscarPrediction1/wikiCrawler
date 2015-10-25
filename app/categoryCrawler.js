var url = require('url');
var request = require('request');
var Q = require('q');

function CatCrawler(db, year) {
	this.year = year;
	this.db = db;
	this.openedQueries = 0;
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
	this.done = Q.defer();
	this.crawl();
	return this.done.promise;
};

CatCrawler.prototype.openQuery = function() {
	this.openedQueries++;
};

CatCrawler.prototype.closeQuery = function () {
	this.openedQueries--;
	if (this.openedQueries === 0) {
		console.log(this.year + ' crawled');
		this.done.resolve();
	}
};

CatCrawler.prototype.crawl = function(cursor) {
	var self = this;
	var crawlUrl = this.url;
	
	if (cursor) {
		crawlUrl.query.cmcontinue = cursor;
	}
	
	crawlUrl = url.format(crawlUrl);
	
	this.openQuery();
	
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
	var self = this;
	this.db.collection('wiki_films').insert(data, function(err) {
		if (err) {
			console.log(err)
			return;
		}
		self.closeQuery();
	});
};

CatCrawler.prototype.yearComplete = function() {
	var self = this;
	this.openQuery();
	
	this.db.collection('wiki_options').update({'key': 'parsedYears'}, {$push: {'value': this.year}}, function(err) {
		if (err) {
			console.log(err);
			return;
		}
		self.closeQuery();
	});
};

module.exports = CatCrawler;