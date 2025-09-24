// --------------------------
// Embedded trail JSON entries
const trails = [
  {
    "id": 1,
    "trail_name": "Dark Hollow Falls Trail",
    "origin_city": "Elkton",
    "region": "Central",
    "mile_marker": 50.7,
    "length_miles": 1.5,
    "length_km": 2.4135,
    "duration_hours": 2,
    "difficulty": "Moderate",
    "elevation_change_ft": 580,
    "elevation_change_m": 176.784,
    "trail_type": "Out-and-back",
    "trail_terrain": "Rocky",
    "popularity": "High",
    "pet_friendly": false,
    "family_friendly": true,
    "waterfall": true,
    "overlook_vista": false,
    "stream_crossing": false,
    "rock_scramble": false,
    "wildlife": false,
    "historic": false,
    "fall_foliage_favorite": true,
    "permit": false,
    "trail_access": "Parking Area",
    "trailhead_coordinates_latitude": 38.519646,
    "trailhead_coordinates_longitude": -78.430999,
    "gpx": "trails/dark-hollow.gpx"
  },
  {
    "id": 2,
    "trail_name": "Whiteoak Canyon Trail",
    "origin_city": "Syria",
    "region": "Central",
    "mile_marker": 42.6,
    "length_miles": 4.6,
    "length_km": 7.4,
    "duration_hours": 4,
    "difficulty": "Moderate",
    "elevation_change_ft": 1070,
    "elevation_change_m": 326,
    "trail_type": "Out-and-back",
    "trail_terrain": "Forest / Waterfalls",
    "popularity": "High",
    "pet_friendly": true,
    "family_friendly": true,
    "waterfall": true,
    "fall_foliage_favorite": true,
    "trail_access": "Parking Area",
    "trailhead_coordinates_latitude": 38.568,
    "trailhead_coordinates_longitude": -78.353,
    "gpx": "trails/whiteoak-canyon.gpx"
  },
  {
    "id": 3,
    "trail_name": "Old Rag Mountain Trail",
    "origin_city": "Etlan",
    "region": "Central",
    "mile_marker": 43,
    "length_miles": 9.1,
    "length_km": 14.6,
    "duration_hours": 8,
    "difficulty": "Strenuous",
    "elevation_change_ft": 2600,
    "elevation_change_m": 792,
    "trail_type": "Loop",
    "trail_terrain": "Rock scramble / Mountain",
    "popularity": "Very High",
    "pet_friendly": false,
    "family_friendly": false,
    "waterfall": false,
    "fall_foliage_favorite": true,
    "trail_access": "Parking Area (Reservation Required)",
    "trailhead_coordinates_latitude": 38.5705,
    "trailhead_coordinates_longitude": -78.3156,
    "gpx": "trails/old-rag.gpx"
  }
];

// --------------------------
// Initialize map (just once)
const map = L.map("map").setView([38.53, -78.43], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let currentMarker = null;
let currentGPX = null;

// --------------------------
// Render a detailed trail card
function renderTrailCard(trailObj) {
  const container = document.getElementById("trail-card");

  const features = [
    trailObj.waterfall ? {label: "Waterfall", emoji:"💧"} : null,
    trailObj.overlook_vista ? {label: "Vista", emoji:"🌄"} : null,
    trailObj.stream_crossing ? {label: "Stream", emoji:"🌊"} : null,
    trailObj.rock_scramble ? {label: "Rock scramble", emoji:"🪨"} : null,
    trailObj.fall_foliage_favorite ? {label: "Fall foliage", emoji:"🍂"} : null,
    trailObj.historic ? {label: "Historic", emoji:"🏛"} : null
  ].filter(Boolean);

  const pet = trailObj.pet_friendly ? "Yes" : "No";
  const family = trailObj.family_friendly ? "Yes" : "No";

  container.innerHTML = `
    <h2>${trailObj.trail_name}</h2>
    <div class="meta">${trailObj.region} • Mile ${trailObj.mile_marker}</div>

    <ul class="stats">
      <li><strong>Length:</strong> ${trailObj.length_miles} miles (${trailObj.length_km.toFixed(2)} km)</li>
      <li><strong>Estimated time:</strong> ${trailObj.duration_hours} hrs</li>
      <li><strong>Type / Terrain:</strong> ${trailObj.trail_type} • ${trailObj.trail_terrain}</li>
      <li><strong>Difficulty:</strong> ${trailObj.difficulty}</li>
      <li><strong>Elevation change:</strong> ${trailObj.elevation_change_ft} ft (${trailObj.elevation_change_m.toFixed(1)} m)</li>
      <li><strong>Popularity:</strong> ${trailObj.popularity}</li>
      <li><strong>Access:</strong> ${trailObj.trail_access}</li>
      <li><strong>Family friendly:</strong> ${family} • <strong>Pet friendly:</strong> ${pet}</li>
    </ul>

    <div class="features">
      ${features.map(f => `<span class="feature-pill">${f.emoji} ${f.label}</span>`).join("")}
    </div>

    <div id="gpx-stats" style="margin-top:10px;color:#333;font-size:0.95rem;">
      <em>GPX status:</em> <span id="gpx-status">Attempting to load GPX...</span>
      <div id="gpx-calculated" style="margin-top:8px;"></div>
    </div>
  `;
}

// --------------------------
// Update map + card for a selected trail
function showTrail(trailObj) {
  // Update card
  renderTrailCard(trailObj);

  // Remove prior marker
  if (currentMarker) {
    map.removeLayer(currentMarker);
    currentMarker = null;
  }

  // Remove prior GPX
  if (currentGPX) {
    map.removeLayer(currentGPX);
    currentGPX = null;
  }

  // Add marker at new trailhead
  currentMarker = L.marker([
    trailObj.trailhead_coordinates_latitude,
    trailObj.trailhead_coordinates_longitude
  ]).addTo(map)
    .bindPopup(`<strong>${trailObj.trail_name}</strong><br/>Trailhead`).openPopup();

  // Load GPX
  currentGPX = new L.GPX(trailObj.gpx, { async: true, marker_options: { startIconUrl:null, endIconUrl:null }})
    .on("loaded", function(e) {
      map.fitBounds(e.target.getBounds(), {padding:[20,20]});
      document.getElementById("gpx-status").textContent = "GPX loaded successfully.";

      const meters = e.target.get_distance();
      const elev_m = e.target.get_elevation_gain();

      const miles = (meters / 1609.34);
      const feet = (elev_m * 3.28084);

      const info = `
        <div><strong>From GPX:</strong> ${miles.toFixed(2)} miles • ${Math.round(feet)} ft elevation gain</div>
        <div style="color:#666;font-size:0.9rem;margin-top:6px;">
          (Note: JSON shows ${trailObj.length_miles} mi • ${trailObj.elevation_change_ft} ft)
        </div>
      `;
      document.getElementById("gpx-calculated").innerHTML = info;
    })
    .on("error", function(err){
      console.error("GPX load error:", err);
      document.getElementById("gpx-status").textContent = "GPX failed to load (check file exists and server).";
      document.getElementById("gpx-calculated").textContent = "";
    })
    .addTo(map);
}

// --------------------------
// Populate dropdown + listen for changes
const select = document.getElementById("trailSelect");
trails.forEach(t => {
  const opt = document.createElement("option");
  opt.value = t.id;
  opt.textContent = t.trail_name;
  select.appendChild(opt);
});
select.addEventListener("change", e => {
  const chosen = trails.find(t => t.id == e.target.value);
  if (chosen) showTrail(chosen);
});

// --------------------------
// Start with first trail
showTrail(trails[0]);
select.value = trails[0].id;
