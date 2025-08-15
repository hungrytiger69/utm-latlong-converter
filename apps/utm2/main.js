(() => {
  // 1) DOM
  const $ = (s) => document.querySelector(s);
  const latEl = $('#lat'), lonEl = $('#lon'), toUTMBtn = $('#toUTM'), utmOut = $('#utmOut');
  const zoneEl = $('#utmZone'), hemEl = $('#utmHem'), eEl = $('#utmE'), nEl = $('#utmN'), toLLBtn = $('#toLL'), llOut = $('#llOut');
  const datumEl = $('#datum');

  // 2) helpers
  const num = (v) => (v === '' || v == null) ? null : Number(v);
  const fmt = (n, d=2) => Number.isFinite(n) ? Number(n).toLocaleString(undefined, { maximumFractionDigits: d }) : '—';

  // 3) geographic CRS (explicit proj strings)
  const datumGeo = {
    WGS84:      '+proj=longlat +datum=WGS84 +no_defs',
    NAD83:      '+proj=longlat +datum=NAD83 +no_defs',            // ~WGS84 in proj4js
    NAD27:      '+proj=longlat +ellps=clrk66 +no_defs',           // avoid +datum=NAD27 (needs grids)
    SIRGAS2000: '+proj=longlat +ellps=GRS80 +towgs84=0,0,0 +no_defs'
  };

  // 4) UTM builders matched to datum/ellipsoid
  const buildUtmProj = (datum, zone, hem) => {
    const south = (hem === 'S') ? ' +south' : '';
    if (datum === 'NAD27')      return `+proj=utm +zone=${zone} +ellps=clrk66${south} +units=m +no_defs`;
    if (datum === 'SIRGAS2000') return `+proj=utm +zone=${zone} +ellps=GRS80 +towgs84=0,0,0${south} +units=m +no_defs`;
    if (datum === 'NAD83')      return `+proj=utm +zone=${zone} +datum=NAD83${south} +units=m +no_defs`;
    return                         `+proj=utm +zone=${zone} +datum=WGS84${south} +units=m +no_defs`;
  };

  // 5) conversions (only these; remove the old ones!)
  function latLonToUTM(lat, lon, datum) {
    const src = datumGeo[datum] || datumGeo.WGS84;
    const zone = Math.floor((lon + 180) / 6) + 1;
    const hem = lat >= 0 ? 'N' : 'S';
    const utm = buildUtmProj(datum, zone, hem);
    // console.debug('latLonToUTM', { src, utm, lat, lon, zone, hem });
    const [E, N] = proj4(src, utm, [lon, lat]);
    return { zone, hem, E, N };
  }

  function utmToLatLon(zone, hem, E, N, datum) {
    const src = buildUtmProj(datum, zone, hem);
    const dst = datumGeo[datum] || datumGeo.WGS84;
    // console.debug('utmToLatLon', { src, dst, zone, hem, E, N, datum });
    const [lon, lat] = proj4(src, dst, [E, N]);
    return { lat, lon };
  }

  // 6) handlers
  toUTMBtn?.addEventListener('click', () => {
    const lat = num(latEl.value), lon = num(lonEl.value), datum = datumEl.value;
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) { utmOut.textContent = 'Enter a latitude between −90 and 90.'; return; }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) { utmOut.textContent = 'Enter a longitude between −180 and 180.'; return; }
    if (lat < -80 || lat > 84) { utmOut.textContent = 'UTM is defined for latitudes between −80° and 84°.'; return; }
    try {
      const { zone, hem, E, N } = latLonToUTM(lat, lon, datum);
      utmOut.textContent = `Zone ${zone}${hem}  E: ${fmt(E,2)} m  N: ${fmt(N,2)} m`;
    } catch (e) {
      console.error('toUTM error:', e);
      utmOut.textContent = 'Conversion error. Check inputs.';
    }
  });

  toLLBtn?.addEventListener('click', () => {
    const zone = Math.trunc(num(zoneEl.value));
    const hem = hemEl.value;
    const E = num(eEl.value), N = num(nEl.value), datum = datumEl.value;
    if (!Number.isFinite(zone) || zone < 1 || zone > 60) { llOut.textContent = 'Zone must be an integer 1–60.'; return; }
    if (!Number.isFinite(E) || !Number.isFinite(N)) { llOut.textContent = 'Enter numeric easting and northing.'; return; }
    try {
      const { lat, lon } = utmToLatLon(zone, hem, E, N, datum);
      llOut.textContent = `Lat: ${fmt(lat,6)}°, Lon: ${fmt(lon,6)}°`;
    } catch (e) {
      console.error('toLL error:', e);
      llOut.textContent = 'Conversion error. Check inputs.';
    }
  });
})();
