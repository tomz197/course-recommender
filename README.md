# pv254-project

Recommendation system for MUNI courses.

## Prerequisites

## Setup

## Usage

## Progresslog

### Scraping data

Scraped with official tool [Prezentátor](https://is.muni.cz/auth/prezentator/)
with query(can be found in `data/prezentator-query.txt`).
Data was saved in `data/raw` directory.


### Data cleaning

Data was cleaned with [jq](https://stedolan.github.io/jq/) tool (used query can be found in `data/jq-query.txt`).
Cleaned data was saved in `data/cleaned` directory.

### Scraping again

Sraping again with improved query (can be found in `data/prezentator-query2.txt`).
Data was saved in `data/formatted` directory.

### Extracting data

Data extraction was done with script `data/gemini.py` via gemini API.
Output was saved in `data/generated` directory.

