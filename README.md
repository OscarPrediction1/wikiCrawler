# wikiCrawler

## Installation

```bash
npm install
```
## Setup MYSQL-DB
* Run sql/wiki_films.sql and sql/wiki_views.sql
* Insert your wiki_films into wiki_films database (pageid is not required)

## Config
* Copy app/config.default.js to app/config.js
* Enter your MYSQL credentials

## Run
Crawl all films
```bash
node crawl_wiki_films.js
```

Crawl only specific url
```bash
node crawl_url.js [URL]
```

## Cloud9
https://ide.c9.io/rechenberger/oscar-wiki-crawler