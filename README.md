# haefele-switzerland-scraper

Web scraper for [haefele.ch](https://www.haefele.ch/).

## Overview

This project is a Node.js-based web scraper designed to collect product or catalog data from the Swiss Häfele website (haefele.ch). It utilizes [Playwright](https://playwright.dev/) for reliable and fast browser automation.

## Features

- Scrapes product data from haefele.ch
- Environment variable support via `.env`
- Output results are saved for easy further processing
- **New:** Added a webpage to view the results directly in your browser!

## Usage

### Prerequisites

- Node.js (v16 or higher recommended)
- npm

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/LooxFoox/haefele-switzerland-scraper.git
cd haefele-switzerland-scraper
npm install
```

### Configuration

Create a `.env` file in the root directory to configure environment variables if needed (e.g. for output path or scraping parameters).

### Running the Scraper

```bash
npm start
```

### Viewing Results

After scraping, you can view the results via the included webpage. Open the provided HTML file (e.g., `results.html`) in your browser to explore the data visually.

## Development

Formatting is handled via [Prettier](https://prettier.io/):

```bash
npm run prettier
```

## License

MIT © LooxFoox

---

> This project was originally forked from hafele-scraper for hafele.pl and adapted for use with haefele.ch.
