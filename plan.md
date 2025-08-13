1) HTML (build the UI)
Goal: two panels (UTM→Lat/Lon and Lat/Lon→UTM) with inputs, buttons, and output areas.

What to do in public/index.html:

Put an HTML5 boilerplate (! → Tab in VS Code).

In <head>, link your CSS and (later) your JS:

html
Copy
Edit
<link rel="stylesheet" href="styles.css">
In <body>, add two <section>s (or <fieldset>s). Give every interactive element an id (your JS will use these):

UTM → Lat/Lon

utmZone (number, min 1, max 60)

utmHem (select: N/S)

utmE (number, step 0.01)

utmN (number, step 0.01)

Button toLL

Output llOut (use <output> or a <div>)

Lat/Lon → UTM

lat (number, step 0.000001)

lon (number, step 0.000001)

Button toUTM

Output utmOut

Place your script at the end of <body> so the DOM is ready when JS runs:

html
Copy
Edit
<script src="main.js"></script>
(Alternative: put it in <head> with defer.)

Tips

Use <label for="id"> so clicking labels focuses inputs.

Add basic placeholder text (e.g., “e.g., 17”).

Keep outputs separate from inputs so you don’t overwrite user text.

2) CSS (make it usable anywhere, including outdoors)
Goal: readable, responsive layout with obvious focus and error states.

What to do in public/styles.css:

Base styles

Set a legible font (system-ui), decent base size (16px), good contrast.

Add a centered container with max-width (e.g., 900px).

Layout

Use CSS Grid or Flex so the two panels sit side-by-side on wide screens and stack on phones.

Form controls

Make inputs and buttons comfortably clickable (min 40px height).

Add :focus-visible outline so keyboard navigation is clear.

Feedback

Create helper classes like:

.out (for results)

.error (red border/text) and .ok (subtle green) for validation.

Responsive

Ensure panels wrap below ~700–900px width.

Test on your phone quickly (VS Code’s Live Preview or just open the file).

You don’t need fancy design—just spacing, readable text, and clear states.

3) JavaScript (wire it up + conversions)
You have two paths. For geology work, use proj4js—it’s accurate and robust.

Option A — Use proj4js (recommended)
What you’ll do in index.html:

Add proj4 via CDN before your main.js (either in <head defer> or just above main.js):

html
Copy
Edit
<script src="https://cdn.jsdelivr.net/npm/proj4/dist/proj4.js" defer></script>
<script src="main.js" defer></script>
What you’ll do in main.js:

Select elements once (top of file):

js
Copy
Edit
const latEl = document.getElementById('lat');
const lonEl = document.getElementById('lon');
const toUTM = document.getElementById('toUTM');
const utmOut = document.getElementById('utmOut');

const zoneEl = document.getElementById('utmZone');
const hemEl  = document.getElementById('utmHem');
const eEl    = document.getElementById('utmE');
const nEl    = document.getElementById('utmN');
const toLL   = document.getElementById('toLL');
const llOut  = document.getElementById('llOut');
Helper functions:

Zone from longitude:

js
Copy
Edit
const zoneFromLon = lon => Math.floor((lon + 180) / 6) + 1;
Build the UTM EPSG code:

js
Copy
Edit
const epsgUTM = (zone, hem) => `EPSG:${(hem === 'N' ? 32600 : 32700) + Number(zone)}`;
Constants:

js
Copy
Edit
const WGS84 = 'EPSG:4326';
Validation (make it strict and friendly):

Lat in [-90, 90]; Lon in [-180, 180].

Zone in [1, 60]; Hem is 'N' or 'S'.

Easting typical range ~160 000–834 000 m (warn if outside).

Northing 0–10 000 000 m (warn if outside).

Show a short message near the relevant field or style the input with .error.

Lat/Lon → UTM click handler:

Parse numbers (parseFloat), validate.

Compute zone from lon; hem from lat sign.

const [E, N] = proj4(epsgUTM(zone, hem), [lon, lat]);

Display with rounding (e.g., toFixed(2) for meters).

UTM → Lat/Lon click handler:

Parse/validate zone/hem/easting/northing.

const [lon, lat] = proj4(epsgUTM(zone, hem), WGS84, [E, N]);

Display as lat.toFixed(6), lon.toFixed(6) (≈ 0.1 m precision).

Why this works: proj4 handles the Transverse Mercator math and edge cases (including southern hemisphere offsets) reliably.

Option B — Roll your own math (not recommended for production)
Implementing UTM directly requires careful constants (a, f, k0), series expansions, and special handling (hemisphere false northing, zone width, scale factor).

Easy to get subtly wrong; you’ll spend time debugging precision. Only do this if you want the learning experience.

4) Testing (trust but verify)
Manual tests (in the browser console or by clicking around):

Round-trip checks

Pick a lat/lon, convert to UTM, then back to lat/lon.

The final lat/lon should match the original within ~1–3 meters (differences mostly from rounding).

Hemisphere

Test a northern point (e.g., Toronto area) and a southern one (e.g., somewhere in Chile).

Zone boundaries

Try longitudes near a multiple of 6° (e.g., -78°, -72°) to ensure zone changes correctly.

Input validation

Enter out-of-range values to confirm your UI shows errors and blocks conversion.

Automated sanity checks (quick & optional)

Drop a few known pairs into tests/test-data.txt. In main.js, write a small debug function that loops those samples and logs PASS/FAIL to the console (only runs when you call it).

Add a round-trip test: for randomly chosen lat/lon, ensure backAgain is within a small epsilon.

Cross-verification

Compare a handful of results against two independent reference tools (e.g., QGIS, another online converter). Consistency across two sources = high confidence.

Common pitfalls to avoid
Forgetting to specify hemisphere for UTM→Lat/Lon.

Mixing datums (assume WGS84 everywhere unless you explicitly add a datum selector).

Using == instead of === (coercion surprises in JS).

Reading input values without parseFloat (strings instead of numbers).

Running JS before the DOM exists (fix with defer or place <script> at the end of <body>).