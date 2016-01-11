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

Crawl multiple films (can be used with year and month)
```bash
node app.js films --boxOfficeIds [boxOfficeId1],[boxOfficeId2],[...],[boxOfficeIdN]
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

## Export
Check if your MYSQL user has the global right to access files.

Export csv (can be used for bigquery)
 ```bash
node export.js bigquery
```

Export csv with custom where
 ```bash
node export.js bigquery --where "[Where-Clause]"
```

## Cloud9
https://ide.c9.io/rechenberger/oscar-wiki-crawler

## Procedure to crawl new nominations
* Add boxOfficeId, pageid, title to wiki_films table
* Run the node app.js films... script with new boxOfficeIds for the month between nomination and awards
* Remove all entries before nomination date && after award date
* Export via node export.js bigquery --where... script where "where" is the duration between nomination and awards