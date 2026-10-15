# SM Sport Performance

Website for SM Sport Performance — independent garage, servicing and performance tuning.

A static site: plain HTML, CSS and JavaScript with no build step.

```
index.html         page content
assets/styles.css  styles
assets/main.js     mobile menu, scroll effects, booking form
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Before going live

Replace the placeholders in `index.html`:

- Phone number (`00000 000000` / `tel:+440000000000`)
- Email (`hello@smsportperformance.example`) — also `BOOKING_EMAIL` in `assets/main.js`
- Address and opening hours
- Hero stats (years' experience, cars serviced)
- Reviews — swap in real customer reviews

The booking form opens the visitor's email app with the request filled in. To receive
submissions directly, point the form at a service such as Formspree or Netlify Forms.

## Deploy

Any static host works: GitHub Pages (Settings → Pages → deploy from branch), Netlify or Vercel.
