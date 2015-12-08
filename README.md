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
node app.js all
```

Crawl only specific film for all years
```bash
node app.js film --boxOfficeId [boxOfficeId]
```

Crawl only a specific year for a specific film
```bash
node app.js film --boxOfficeId [boxOfficeId] --year [year]
```

Crawl only a specific month for a specific film
```bash
node app.js film --boxOfficeId [boxOfficeId] --year [year] --month [month]
```

Crawl only a specific url for a specific film
```bash
node app.js film --boxOfficeId [boxOfficeId] --url [url]
```

## Cloud9
https://ide.c9.io/rechenberger/oscar-wiki-crawler