// app.js — offline declination using WMM via the `geomagnetism` library
// Library docs/API: model().point([lat, lon, alt_km]) → { decl, incl, ... } :contentReference[oaicite:0]{index=0}

// Import the library straight from a module CDN.
// If you prefer, pin the version (e.g., @0.2.0).
import geomagnetism from "https://esm.sh/geomagnetism";

init();

function init() {
  const dateEl = document.getElementById('date');
  dateEl.value = toISODate(new Date());

  document.getElementById('btn-geolocate').addEventListener('click', getBrowserLocation);
  document.getElementById('btn-compute').addEventListener('click', handleComputeClick);

  getBrowserLocation(); // optional auto-try
}

function setStatus(msg) { document.getElementById('status').textContent = msg; }
function setResult(text) { document.getElementById('result').textContent = text; }
function toISODate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function getBrowserLocation() {
  if (!('geolocation' in navigator)) {
    setStatus('Geolocation not available. Enter coordinates manually.');
    return;
  }
  setStatus('Asking for location permission…');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      document.getElementById('lat').value = latitude.toFixed(6);
      document.getElementById('lon').value = longitude.toFixed(6);
      setStatus('Got your location. Click Compute.');
    },
    (err) => {
      setStatus(`Couldn’t get location (${err.code}): ${err.message}. Enter coords and click Compute.`);
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );
}

async function handleComputeClick() {
  setStatus('Computing declination…');

  const lat = parseFloat(document.getElementById('lat').value);
  const lon = parseFloat(document.getElementById('lon').value);
  const dateStr = document.getElementById('date').value;

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !dateStr) {
    setStatus('Please provide latitude, longitude, and date.');
    setResult('');
    return;
  }

  const date = new Date(dateStr + 'T12:00:00Z');

  try {
    const decDeg = await computeDeclination(lat, lon, date);
    const eastWest = decDeg >= 0 ? 'E' : 'W';
    const mag = Math.abs(decDeg).toFixed(2);
    setResult(`Magnetic declination: ${mag}° ${eastWest}`);
    setStatus('Done.');
  } catch (err) {
    setStatus('There was an error computing declination. See console for details.');
    setResult('');
    console.error(err);
  }
}

// ---- WMM via geomagnetism (cached per date) ----
let _modelCache = { key: null, model: null };

async function computeDeclination(lat, lon, date) {
  // Key by day so changing the date updates the model when needed.
  const key = date.toISOString().slice(0, 10);

  if (!_modelCache.model || _modelCache.key !== key) {
    // allowOutOfBoundsModel: true → if date is slightly outside a model’s range,
    // it gracefully falls back to the nearest available model. :contentReference[oaicite:1]{index=1}
    _modelCache.model = geomagnetism.model(date, { allowOutOfBoundsModel: true });
    _modelCache.key = key;
  }

  // altitude is optional; use 0 km above MSL for now
  const info = _modelCache.model.point([lat, lon, 0]); // [lat, lon, altitude_km]
  // `info.decl` is in degrees; east positive, west negative (WMM convention). :contentReference[oaicite:2]{index=2}
  return info.decl;
}
