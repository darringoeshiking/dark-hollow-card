// --------------------------
// Initialize the map (set to a reasonable center/zoom initially)
const map = L.map("map").setView([38.519646, -78.430999], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let gpxLayer = null;
let gpxStartMarker = null;

// --------------------------
// Trail data (you can expand this with more trails later)
const trails = [
  {
    id: 1,
    trail_name: "Dark Hollow Falls Trail",
    region: "Central",
    mile_marker: 50.7,
    length_miles: 1.5,
    length_km: 2.41,
    duration_hours: 2,
    difficulty: "Moderate",
    elevation_change_ft: 580,
    elevation_change_m: 176.8,
    trail_type: "Out-and-back",
    trail_terrain: "Rocky",
    popularity: "High",
    pet_friendly: false,
    family_friendly: true,
    waterfall: true,
    fall_foliage_favorite: true,
    trail_access: "Parking Area",
    gpx: "trails/dark-hollow.gpx"
  },
  {
    id: 2,
    trail_name: "Whiteoak Canyon Trail",
    region: "Central",
    mile_marker: 42.6,
    length_miles: 4.6,
    length_km: 7.4,
    duration_hours: 4,
    difficulty: "Moderate",
    elevation_change_ft: 1070,
    elevation_change_m: 326,
    trail_type: "Out-and-back",
    trail_terrain: "Forest / Waterfalls",
    popularity: "High",
    pet_friendly: true,
    family_friendly: true,
    waterfall: true,
    fall_foliage_favorite: true,
    trail_access: "Parking Area",
    gpx: "trails/whiteoak-canyon.gpx"
  },
  {
    id: 3,
    trail_name: "Old Rag Mountain Trail",
    region: "Central",
    mile_marker: 43,
    length_miles: 9.1,
    length_km: 14.6,
    duration_hours: 8,
    difficulty: "Strenuous",
    elevation_change_ft: 2600,
    elevation_change_m: 792,
    trail_type: "Loop",
    trail_terrain: "Rock scramble / Mountain",
    popularity: "Very High",
    pet_friendly: false,
    family_friendly: false,
    waterfall: false,
    fall_foliage_favorite: true,
    trail_access: "Parking Area (Reservation Required)",
    gpx: "trails/old-rag.gpx"
  }
];

// --------------------------
// Render the trail card
function renderTrailCard(trailObj) {
  const container = document.getElementById("trail-card");

  const features = [
    trailObj.waterfall ? { label: "Waterfall", emoji: "💧" } : null,
    trailObj.overlook_vista ? { label: "Vista", emoji: "🌄" } : null,
    trailObj.stream_crossing ? { label: "Stream", emoji: "🌊" } : null,
    trailObj.rock_scramble ? { label: "Rock scramble", emoji: "🪨" } : null,
    trailObj.fall_foliage_favorite
      ? { label: "Fall foliage", emoji: "🍂" }
      : null,
    trailObj.historic ? { label: "Historic", emoji: "🏛" } : null,
  ].filter(Boolean);

  const pet = trailObj.pet_friendly ? "Yes" : "No";
  const family = trailObj.family_friendly ? "Yes" : "No";

  container.innerHTML = `
    <h2>${trailObj.trail_name}</h2>
    <div class="meta">${trailObj.region} • Mile ${trailObj.mile_marker}</div>

    <ul class="stats">
      <li><strong>Length:</strong> ${trailObj.length_miles} miles (${trailObj.length_km.toFixed(
    2
  )} km)</li>
      <li><strong>Estimated time:</strong> ${trailObj.duration_hours} hrs</li>
      <li><strong>Type / Terrain:</strong> ${trailObj.trail_type} • ${
    trailObj.trail_terrain
  }</li>
      <li><strong>Difficulty:</strong> ${trailObj.difficulty}</li>
      <li><strong>Elevation change:</strong> ${
        trailObj.elevation_change_ft
      } ft (${trailObj.elevation_change_m.toFixed(1)} m)</li>
      <li><strong>Popularity:</strong> ${trailObj.popularity}</li>
      <li><strong>Access:</strong> ${trailObj.trail_access}</li>
      <li><strong>Family friendly:</strong> ${family} • <strong>Pet friendly:</strong> ${pet}</li>
    </ul>

    <div class="features">
      ${features
        .map(
          (f) => `<span class="feature-pill">${f.emoji} ${f.label}</span>`
        )
        .join("")}
    </div>

    <div id="gpx-status" style="margin-top:10px;color:#333;font-size:0.95rem;">
      <em>GPX status:</em> <span>Loading...</span>
    </div>
    <div id="gpx-calculated" style="margin-top:8px;color:#333;font-size:0.95rem;"></div>
  `;
}

// --------------------------
// Load GPX and drop a pin at its starting point
async function tryLoadGPX(path) {
  if (gpxLayer) {
    map.removeLayer(gpxLayer);
    gpxLayer = null;
  }
  if (gpxStartMarker) {
    map.removeLayer(gpxStartMarker);
    gpxStartMarker = null;
  }

  try {
    gpxLayer = new L.GPX(path, {
      async: true,
      marker_options: { startIconUrl: null, endIconUrl: null },
    })
      .on("loaded", async function (e) {
        map.fitBounds(e.target.getBounds(), { padding: [20, 20] });

        const statusSpan = document.querySelector("#gpx-status span");
        if (statusSpan) statusSpan.textContent = "GPX loaded successfully.";

        try {
          const resp = await fetch(path);
          const txt = await resp.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(txt, "application/xml");
          const firstPt =
            xml.querySelector("trkseg trkpt") || xml.querySelector("trkpt");

          if (firstPt) {
            const gpLat = parseFloat(firstPt.getAttribute("lat"));
            const gpLon = parseFloat(firstPt.getAttribute("lon"));

            gpxStartMarker = L.marker([gpLat, gpLon])
              .addTo(map)
              .bindPopup(`Trailhead (from GPX)<br/>${gpLat.toFixed(
                6
              )}, ${gpLon.toFixed(6)}`)
              .openPopup();

            const calcDiv = document.getElementById("gpx-calculated");
            if (calcDiv) {
              calcDiv.innerHTML = `<div>First GPX point at: ${gpLat.toFixed(
                6
              )}, ${gpLon.toFixed(6)}</div>`;
            }
          }
        } catch (parseErr) {
          console.error("GPX parse error:", parseErr);
          const calcDiv = document.getElementById("gpx-calculated");
          if (calcDiv) calcDiv.textContent =
            "Could not parse GPX for start point.";
        }
      })
      .on("error", function (err) {
        console.error("GPX load error:", err);
        const statusSpan = document.querySelector("#gpx-status span");
        if (statusSpan) statusSpan.textContent = "GPX load failed.";
      })
      .addTo(map);
  } catch (err) {
    console.error("Error initializing GPX:", err);
    const statusSpan = document.querySelector("#gpx-status span");
    if (statusSpan) statusSpan.textContent = "GPX plugin error.";
  }
}

// --------------------------
// Trail selection dropdown
const selectEl = document.getElementById("trailSelect");

// Populate dropdown
trails.forEach((t) => {
  const opt = document.createElement("option");
  opt.value = t.id;
  opt.textContent = t.trail_name;
  selectEl.appendChild(opt);
});

// On change, render new trail + GPX
selectEl.addEventListener("change", (e) => {
  const trailId = parseInt(e.target.value);
  const selectedTrail = trails.find((t) => t.id === trailId);
  if (selectedTrail) {
    renderTrailCard(selectedTrail);
    tryLoadGPX(selectedTrail.gpx);
  }
});

// --------------------------
// Start with first trail
renderTrailCard(trails[0]);
tryLoadGPX(trails[0].gpx);
