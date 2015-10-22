var fs = require('fs');
var events = require('events');
var request = require('request');
var cheerio = require('cheerio');
var url =  require('url');
var _ = require('lodash');
var bc = require('./betterConsole');

var cursors = new events.EventEmitter();
var parsedSeedLink;

exports.start = function(year) {
	var seedLink = 'https://en.wikipedia.org/w/index.php?title=Category:' + year + '_films';
	parsedSeedLink = url.parse(seedLink, true);
	cursors.emit('added', {cursor: seedLink, first: true})
};

cursors.on('added', function(data) {
	var first = false;
	if (data.first === true) {
		first = true;
	}
	loadCategorySite(data.cursor, first);
});

function loadCategorySite(link, first) {
	bc.loadingLog('Parsing site ' + link);
	request(link, function(err, res, body) {
		//TODO: Error Handling
		
		var $ = cheerio.load(body);
		var cursor = getCursor($, first);
		
		if (cursor) {
			cursors.emit('added', {cursor: cursor});
		}
		
		saveMovies($);
	});
}

function getCursor(cherrioBody, first) {
	var $ = cherrioBody;
	var cursors = $('#mw-pages > a').map(function() {	
		var href = $(this).attr('href');
		
		var link = url.parse(href, true);
		
		//Wenn der Link kein pageuntil beinhaltet, 
		//dann ist er kein Cursor, der auf die nächste Seite zeigt
		// if (!link.query.pageuntil) {
		// 	return;
		// }
		
		createAbsoluteLink(link);
		
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
	if (cursors.length === 1 && first) {
		return cursors[0];
	}
}

function saveMovies(cherrioBody) {
	var $ = cherrioBody;
	$('#mw-pages .mw-category a').each(function() {
		var title = $(this).attr('title');
		var href = $(this).attr('href');
		var link = url.parse(href, true);
		
		createAbsoluteLink(link);
		
		write({
			title: title,
			href: url.format(link)
		});
	});
}

function createAbsoluteLink(link, options) {
	if (typeof link === 'string') {
		link = url.parse(link, true);
	}
	
	if (!link.host) {
		link.protocol = parsedSeedLink.protocol;
		link.host = parsedSeedLink.host;
	}
}

function write(data) {
	fs.appendFile('data.json', JSON.stringify(data));
}