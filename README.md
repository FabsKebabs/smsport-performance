# SM Sport Performance

Website for SM Sport Performance: garage, performance tuning, drift and track builds, servicing,
repairs and vehicle recovery.

A static site: plain HTML, CSS and JavaScript with no build step.

```
index.html         page content
assets/styles.css  styles
assets/main.js     mobile menu, scroll effects, booking form
assets/img/        logo (white + black transparent PNGs) and photos
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Before going live

These are placeholders in `index.html` — replace them with the real details:

- Phone `07000 000000` / `tel:+447000000000` (appears in the hero, recovery banner, booking section and mobile call button)
- Email `hello@smsportperformance.co.uk` — also `BOOKING_EMAIL` in `assets/main.js`
- Workshop address (`Unit address, Town, Postcode`)
- Opening hours (`Mon–Fri 9:00–17:30`)

The booking form opens the visitor's email app with the request filled in. To receive
submissions directly, point the form at a service such as Formspree or Netlify Forms.

## Deploy

Any static host works: GitHub Pages (Settings → Pages → deploy from branch), Netlify or Vercel.
