// ============================
// Trail Data (add more trails as needed)
// ============================
const trails = [
  {
    name: "Dark Hollow Falls Trail",
    file: "trails/dark-hollow.gpx",
    stats: {
      length: "1.5 miles",
      elevation: "580 ft",
      difficulty: "Moderate",
      type: "Out-and-back",
      features: "Waterfall, Rocky Terrain",
      location: "Mile Marker 50.7, Central District"
    }
  },
  {
    name: "Whiteoak Canyon Trail",
    file: "trails/whiteoak.gpx",
    stats: {
      length: "4.6 miles",
      elevation: "1,000 ft",
      difficulty: "Hard",
      type: "Out-and-back",
      features: "Waterfalls, Stream Crossings",
      location: "Mile Marker 42.6, Central District"
    }
  },
  {
    name: "Blackrock Summit Loop",
    file: "trails/blackrock.gpx",
    stats: {
      length: "1.1 miles",
      elevation: "175 ft",
      difficulty: "Easy",
      type: "Loop",
      features: "Overlook, Rock Scramble",
      location: "Mile Marker 84.8, South District"
    }
  }
];

// ============================
// Map Setup
// ============================
const map = L.map("map").setView([38.53, -78.35], 12);

// Base map tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// ============================
// Global Variables
// ============================
let currentGpxLayer = null;
let currentMarker = null;

// ============================
// Populate Trail Dropdown
// ============================
const trailSelect = document.getElementById("trailSelect");
trails.forEach((trail, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = trail.name;
  trailSelect.appendChild(option);
});

// ============================
// Load Selected Trail
// ============================
function loadTrail(index) {
  const trail = trails[index];

  // Remove previous trail and marker
  if (currentGpxLayer) {
    map.removeLayer(currentGpxLayer);
  }
  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  // Load GPX
  currentGpxLayer = new L.GPX(trail.file, {
    async: true,
    marker_options: {
      startIconUrl: "https://unpkg.com/leaflet-gpx@1.7.0/pin-icon-start.png",
      endIconUrl: "https://unpkg.com/leaflet-gpx@1.7.0/pin-icon-end.png",
      shadowUrl: "https://unpkg.com/leaflet-gpx@1.7.0/pin-shadow.png"
    }
  })
    .on("loaded", (e) => {
      map.fitBounds(e.target.getBounds());

      // Place a marker at the start of the trail
      const start = e.target.get_start_latlng();
      currentMarker = L.marker(start).addTo(map);
    })
    .addTo(map);

  // Update Trail Card
  updateTrailCard(trail);
}

// ============================
// Trail Card Display
// ============================
function updateTrailCard(trail) {
  const card = document.getElementById("trail-card");
  card.innerHTML = `
    <h2>${trail.name}</h2>
    <p><strong>Length:</strong> ${trail.stats.length}</p>
    <p><strong>Elevation Gain:</strong> ${trail.stats.elevation}</p>
    <p><strong>Difficulty:</strong> ${trail.stats.difficulty}</p>
    <p><strong>Type:</strong> ${trail.stats.type}</p>
    <p><strong>Features:</strong> ${trail.stats.features}</p>
    <p><strong>Location:</strong> ${trail.stats.location}</p>
  `;
}

// ============================
// Event Listener
// ============================
trailSelect.addEventListener("change", (e) => {
  loadTrail(e.target.value);
});

// ============================
// Load First Trail by Default
// ============================
loadTrail(0);
