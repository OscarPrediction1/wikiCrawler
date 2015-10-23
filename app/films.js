// var fs = require('fs');
var events = require('events');
var request = require('request');
var cheerio = require('cheerio');
var url =  require('url');
var _ = require('lodash');
var bc = require('./betterConsole');

function Films(db) {
	this.db = db;
}

Films.prototype.start = function(year) {
	this.year = year;
	var seedLink = 'https://en.wikipedia.org/w/index.php?title=Category:' + year + '_films';
	this.cursors = new events.EventEmitter();
	this.parsedSeedLink = url.parse(seedLink, true);
	var self = this;
	
	this.cursors.on('added', function(data) {
		var first = false;
		if (data.first === true) {
			first = true;
		}
		self.loadCategorySite(data.cursor, first);
	});
	
	this.cursors.emit('added', {cursor: seedLink, first: true});
};

Films.prototype.loadCategorySite = function(link, first) {
	var self = this;
	// bc.loadingLog('Parsing site ' + link);
	// console.log('Parsing site ' + link);
	request(link, function(err, res, body) {
		if (err) {
			console.log(link, 'nicht erreichbar');
			return;
		}
		
		var $ = cheerio.load(body);
		var cursor = self.getCursor($, first);
		
		if (cursor) {
			self.cursors.emit('added', {cursor: cursor});
		}
		
		self.saveMovies($);
	});
};

Films.prototype.getCursor = function(cherrioBody, first) {
	var self = this;
	var $ = cherrioBody;
	var cursors = $('#mw-pages > a').map(function() {	
		var href = $(this).attr('href');
		
		var link = url.parse(href, true);
		
		//Wenn der Link kein pageuntil beinhaltet, 
		//dann ist er kein Cursor, der auf die nächste Seite zeigt
		// if (!link.query.pageuntil) {
		// 	return;
		// }
		
		self.createAbsoluteLink(link);
		
		return url.format(link);
	}).get();
	
	cursors = _.uniq(cursors);
	
	//Wenn 2 Links vorhanden, dann ist es eine einfache Vor/Zurück Navigation
	//Wähle den zweiten Link, da er vorwärts führt
	if (cursors.length === 2) {
		return cursors[1];
	}
	
	//Falls es nur einen Link gibt, dann ist es entweder Startseite (first) oder
	//Endseite. Falls Endseite gib nichts zurück.
	if (cursors.length === 1) {
		if (first) {
			return cursors[0];
		}
		
		console.log(this.year + ' wurde abgeschlossen');
		this.yearComplete();
	}
};

Films.prototype.saveMovies = function(cherrioBody) {
	var self = this;
	var $ = cherrioBody;
	//TODO: Anscheinend werden noch Listen mitgespeichert
	$('#mw-pages .mw-category a').each(function() {
		var title = $(this).attr('title');
		var href = $(this).attr('href');
		var link = url.parse(href, true);
		
		self.createAbsoluteLink(link);
		
		var wikiName = link.pathname;
		wikiName = wikiName.replace('/wiki/','');
		
		self.write({
			title: title,
			href: url.format(link),
			wikiName: wikiName,
			year: self.year
		});
	});
};

Films.prototype.createAbsoluteLink = function(link, options) {
	if (typeof link === 'string') {
		link = url.parse(link, true);
	}
	
	if (!link.host) {
		link.protocol = this.parsedSeedLink.protocol;
		link.host = this.parsedSeedLink.host;
	}
};

Films.prototype.write = function(data) {
	//fs.appendFile('data.json', JSON.stringify(data));
	this.db.collection('wiki_films').insert(data);
};

Films.prototype.yearComplete = function(data) {
	this.db.collection('wiki_options').update({'key': 'parsedYears'}, {$push: {'value': this.year}});
};


module.exports = Films;