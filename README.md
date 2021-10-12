# Hafele.pl web scraper

### Authorization
Store your credentials in the `.env` file:
```
HAFELE_USER=XXXXXX
HAFELE_PASS=XXXXXX
```

### Workflow
App requires a `products.json` (in the root directory) as an input array of urls.
It outputs the `out.json` file like this:

```
[
  {
    "url": "https://www.hafele.pl/pl/product/zawias-puszkowy/34283160/",
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

---

Install
```
npm install
```

Run
```
npm start
```
