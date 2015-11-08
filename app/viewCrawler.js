var url = require('url');
var request = require('request');
var Q = require('q');

function ViewCrawler(db, title, year, pageid) {
	this.year = year;
	this.db = db;
	this.title = title;
	this.pageid = pageid;
	this.openedQueries = 0;
	this.url = 'http://stats.grok.se/json/en/'
};

ViewCrawler.prototype.start = function() {
	// console.log("Started view crawling for: " + this.title)
	this.done = Q.defer();
	this.crawl();
	return this.done.promise;
};

ViewCrawler.prototype.openQuery = function() {
	this.openedQueries++;
};

ViewCrawler.prototype.closeQuery = function () {
	this.openedQueries--;
	if (this.openedQueries === 0) {
		// console.log(this.title + ' crawled');
		this.done.resolve();
	}
};

ViewCrawler.prototype.getUrl = function(month) {
	if (month.toString().length !== 2) {
		month = '0' + month;
	}
	return this.url + this.year + month + '/' + this.title;
};

ViewCrawler.prototype.crawl = function(month) {
	var self = this;
	var crawlUrl;
	
	if (!month) {
		month = 1;
	}
	
	crawlUrl = this.getUrl(month);
	
	this.openQuery();
	
	request(crawlUrl, function(err, res, body) {
		if (err) {
			console.log(crawlUrl + ' nicht erreichbar');
			return;
		}
		
		try {
			var result = JSON.parse(body);
		} catch (e) {
			console.log(e);
			console.log("in " + self.title);
			self.write([])
			return;
		}
		
		var views = result.daily_views;
		
		if (month < 12) {
			self.crawl(++month);
		}
		
		// var data = {};
		var data = [];
		
		for (var i in views) {
			// data['views.' + i] = views[i];
			data.push({'date': new Date(i), views: views[i]});
		}
		
		self.write(data);
	});
};

ViewCrawler.prototype.write = function(data) {
	var self = this;
	// if (Object.keys(data).length === 0) {
	// 	console.log("No data: " + this.title);
	// 	return;
	// }
	// this.db.collection('wiki_films').update({pageid: this.pageid}, {$set: data}, function(err) {
	this.db.collection('wiki_films').update({pageid: this.pageid}, {$push: {views: {$each: data}}}, function(err) {
		if (err) {
			console.log(err)
			return;
		}
		self.closeQuery();
	});
};

module.exports = ViewCrawler;