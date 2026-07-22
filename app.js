document
  .getElementById("gpxFile")
  .addEventListener("change", handleFile);

function handleFile(event) {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {

    const parser = new DOMParser();

    const xml = parser.parseFromString(
      e.target.result,
      "application/xml"
    );

    analyse(xml);
  };

  reader.readAsText(file);
}

function analyse(xml) {

  const points =
    xml.getElementsByTagName("trkpt");

  if (points.length === 0) {

    document.getElementById("resultat")
      .innerHTML =
      "<h2>Fant ingen sporpunkter.</h2>";

    return;
  }

  let km = 0;
  let hm = 0;
  let previousElevation = null;

  for (let i = 0; i < points.length; i++) {

    const point = points[i];

    const elevationElement =
      point.getElementsByTagName("ele")[0];

    const elevation =
      elevationElement
        ? parseFloat(elevationElement.textContent)
        : null;

    if (
      previousElevation !== null &&
      elevation !== null
    ) {

      const diff =
        elevation - previousElevation;

      if (diff > 0) {
        hm += diff;
      }
    }

    previousElevation = elevation;

    if (i > 0) {

      const p1 = points[i - 1];
      const p2 = points[i];

      km += haversine(
        parseFloat(p1.getAttribute("lat")),
        parseFloat(p1.getAttribute("lon")),
        parseFloat(p2.getAttribute("lat")),
        parseFloat(p2.getAttribute("lon"))
      );
    }
  }

  const distanceBeers = km / 35;
  const climbingBeers = hm / 800;

  const pils = Math.max(
    1,
    Math.round(
      distanceBeers + climbingBeers
    )
  );

  document.getElementById("resultat")
    .innerHTML = `

<h2>🍺 Resultat 🍺</h2>

<p>🚴 ${km.toFixed(1)} km</p>

<p>⛰️ ${Math.round(hm)} hm</p>

<h3>Grunnlag</h3>

<p>• ${distanceBeers.toFixed(1)} pils fra distanse</p>

<p>• ${climbingBeers.toFixed(1)} pils fra høydemeter</p>

<h2>${pils} pils</h2>

<p style="font-size: 28px">
${"🍺".repeat(pils)}
</p>

<p>
<strong>DRIKK MED HJELM 🍺⛑️</strong>
</p>
`;
}

function haversine(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R = 6371;

  const dLat =
    (lat2 - lat1) * Math.PI / 180;

  const dLon =
    (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}
