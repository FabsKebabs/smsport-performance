# SM Sport Performance

Website for SM Sport Performance: an independent garage for servicing, diagnostics, repairs,
performance tuning, drift and track builds, and vehicle recovery.

It's a static site (plain HTML, CSS and JavaScript). There is nothing to install or build, so
it runs on any web host, including GitHub Pages for free.

## Update the business details

Every phone number, WhatsApp button, email address, the workshop address, opening hours and
social links come from one file: **`assets/config.js`**.

To edit it on GitHub:

1. Open `assets/config.js` in the repository and click the pencil icon (Edit this file).
2. Change the values between the quote marks, for example `phone: '07123 456789'`.
3. Click **Commit changes**. If the site is on GitHub Pages it updates within a minute or two.

What each setting does:

| Setting    | What to put in it |
|------------|-------------------|
| `phone`    | The number as it should appear, e.g. `07123 456789`. The tap-to-call links are worked out from it. |
| `whatsapp` | 44 followed by the mobile number without its first 0, e.g. `447123456789`. Leave `''` to hide every WhatsApp button. |
| `email`    | Where emailed job cards go. |
| `address`  | Street, town and postcode. The Directions button opens Google Maps with this address. |
| `hours`    | One entry per day, 24-hour clock, e.g. `'09:00-17:30'`. Use `''` for closed days. The site shows "Open now" or "Closed" using UK time. |
| `socials`  | Full links to Instagram, TikTok, Facebook or YouTube. Empty ones are hidden. |
| `url`      | The website's address. Change it if you move to your own domain. |

While the phone number is still the placeholder `07000 000000`, a yellow **Preview** bar shows at
the top of the site as a reminder. It disappears once a real number is in.

## Before going live

- [ ] Real phone, WhatsApp, email, address and opening hours in `assets/config.js`.
- [ ] Read through the wording and change anything that isn't right for the business. In
      particular, these lines are promises the site makes:
  - "We find the problem and agree the price with you before any work starts" (How it works, FAQ)
  - "Every build starts with a health check" (Performance)
  - The About text, which says the business is run by car enthusiasts who build and drive cars
    like the SM drift car
- [ ] Check the FAQ answers.
- [ ] Make sure everyone is happy for the photos and video to be public (number plates are
      visible on the recovery truck and the cars).

## Put it online with GitHub Pages

1. Merge this branch into `main`.
2. In the repository go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`,
   then **Save**.
4. After a minute or two the site is live at
   `https://fabskebabs.github.io/smsport-performance/`.

### Using your own domain

Add the domain under **Settings → Pages → Custom domain**, then update the address in three
places so Google and link previews use it:

- `url` in `assets/config.js`
- `<link rel="canonical">` and the `og:url` / `og:image` tags near the top of `index.html`

## How bookings work

The **job card** form doesn't need a server. When a customer finishes it, the site writes the
job card out as a message and offers three ways to send it:

- **Send on WhatsApp** opens WhatsApp with the message ready to send to your number.
- **Send by email** opens their email app with the message addressed to you.
- **Copy text** copies it so they can paste it anywhere.

Each job card gets a reference number like `SMSP-1016-0915` (date and time), so you can refer
to it when you reply. Nothing is sent until the customer presses send in WhatsApp or their email
app.

## What's in the repository

```
index.html             the page
404.html               "page not found" page
assets/config.js       business details (edit this one)
assets/styles.css      the design
assets/main.js         menu, hours, video, photo viewer, job card
assets/img/            logo (logo.svg), photos in two sizes each, video cover image
assets/video/          workshop clip as MP4 and WebM (the browser picks the one it can play)
favicon.svg            browser tab icon, plus favicon-32.png and apple-touch-icon.png
og-image.jpg           preview image shown when the link is shared on WhatsApp, Facebook etc.
```

## Adding photos or video

Photos are saved as `.webp` in two widths (a smaller one for phones, a larger one for big
screens and the photo viewer), for example `drift-car-960.webp` and `drift-car-1680.webp`.
To add a photo to the gallery, copy one of the `gallery__item` buttons in the Workshop section
of `index.html` and point it at the new files.

The video doesn't download until someone presses play. It's in two formats so it plays in every
browser: `workshop.mp4` (H.264) and `workshop.webm` (VP9).

## Run it on your computer

Open `index.html` in a browser, or serve the folder so everything behaves as it will online:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.
