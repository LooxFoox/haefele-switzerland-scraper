# Hafele.pl web scraper

### Motivation
**hafele.pl** makes it hard to get the information on the maximum quantity of a product you can order at a time.

This scraper simplifies this process to passing the product's ID.

### Workflow
App requires a `products.json` (in the root directory) as an input array of urls.

It outputs the `out.json` file like this:

```
[
  {
    "id": "34283160",
    "url": "https://www.hafele.pl/pl/product/zawias-puszkowy/34283160/?MasterSKU=000000000000139200020023",
    "qty": 2700,
    "thumbnails": [
      "https://www.hafele.pl/prod-live/static/WFS/Haefele-HPL-Site/-/Haefele/pl_PL/images/default/zawias-puszkowy_342.83.160_x/00260551_0.jpg",
      "https://www.hafele.pl/prod-live/static/WFS/Haefele-HPL-Site/-/Haefele/pl_PL/images/default/zawias-puszkowy_342.83.160_x/02047027_0.jpg",
      "https://www.hafele.pl/prod-live/static/WFS/Haefele-HPL-Site/-/Haefele/pl_PL/images/default/zawias-puszkowy_342.83.160_x/01128652_0.jpg",
      "https://www.hafele.pl/prod-live/static/WFS/Haefele-HPL-Site/-/Haefele/pl_PL/images/default/zawias-puszkowy_342.83.160_x/01935650_0.jpg"
    ]
  }
]
```

Each item in this array of products consists of the fields listed below:

- **id**: id of the product
- **url**: link to the crawled product
- **qty**: maximum available quantity
- **thumbnails**: array of thumbnails

---

### Getting started
###### Authorization
Store your credentials in the `.env` file:
```
HAFELE_USER=XXXXXX
HAFELE_PASS=XXXXXX
```

###### Data
Fill in the `products.json` file in the root directory with all the products' URLs you want to scrap from.

###### Install
```
npm install
```

###### Run
```
npm start
```
