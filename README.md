This project is a static web app that converts coordinates between UTM (Universal Transverse Mercator) and Latitude/Longitude (WGS84 datum). It’s aimed at geologists and others working with spatial data who want a simple, offline-friendly tool with a visual interface.

## Goal
- Input UTM coordinates (Zone, Hemisphere, Easting, Northing) → Output Lat/Lon
- Input Lat/Lon → Output UTM (auto-detect zone & hemisphere but changeable if wanted)
- Provide a clean, intuitive UI using only HTML, CSS, and JavaScript (no frameworks)
- Optionally display the location on a map preview
- -link to google maps

## File Overview
### /public/index.html
- HTML page layout for the GUI.

### /public/styles.css
- CSS styling for layout and colors.

### /public/main.js
- JavaScript logic for handling conversions.

### /assets/
- Optional images, icons, or branding.

### /tests/test-data.txt
- Known coordinate pairs for validation.

## How to Implement
1. **HTML**: Create form inputs for UTM and Lat/Lon, buttons to trigger conversion, and output sections for results.
2. **CSS**: Style the layout, make it responsive, ensure good contrast for field use.
3. **JavaScript**: Implement conversion formulas or use proj4js, add event listeners, validate input, update outputs.
4. **Testing**: Use sample data to verify accuracy, check round-trip conversions.

## Running the Project
Open `/public/index.html` in any modern web browser — no server needed.
