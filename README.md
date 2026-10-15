# SM Motoring Services

Website for SM Motoring Services, Edwin Street, Houghton-le-Spring: servicing, MOT, diagnostics,
tyres, repairs, performance, storage and 24/7 recovery.

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

Check these against the business before publishing (taken from public listings):

- Phone `0191 810 0058`, email `info@smmotoring.co.uk`
- Address postcode — listed as DH5 8BH on the old site but DH5 8AR on one directory
- Prices: £99 interim service, £149 with MOT, +£30 specialist oil
- Opening hours are not on the page yet
- "15+ years", "2.6M+ TikTok likes" and "5-star reviews" are taken from the old site — keep them current
- Reviews are placeholders — swap in real customer reviews

The booking form opens the visitor's email app with the request filled in. To receive
submissions directly, point the form at a service such as Formspree or Netlify Forms.

## Deploy

Any static host works: GitHub Pages (Settings → Pages → deploy from branch), Netlify or Vercel.

## Adding photos and the logo

The logo is recreated in code (Rubik Wet Paint + Anton fonts with the purple–pink gradient).
To use the real logo or workshop photos, put the files in `assets/img/` and reference them from
`index.html` — e.g. replace the `<span class="logo__sm">` / `<span class="logo__text">` pair with
`<img src="assets/img/logo.png" alt="SM Motoring Services" height="48">`.
