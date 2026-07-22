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

  const elevations = [];

  for (let i = 0; i < points.length; i++) {

    const ele =
      points[i]
        .getElementsByTagName("ele")[0];

    if (ele) {

      elevations.push(
        parseFloat(ele.textContent)
      );
    }

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

  for (let i = 1; i < elevations.length; i++) {

    const diff =
      elevations[i] -
      elevations[i - 1];

    if (diff > 0.8) {
      hm += diff;
    }
  }

  const biggestClimb =
    findBiggestClimb(elevations);

  const distanceBeers =
    km / 35;

  const climbingBeers =
    hm / 800;

  let bonus = 0;

  if (biggestClimb >= 500)
    bonus += 1;

  if (biggestClimb >= 1000)
    bonus += 2;

  if (biggestClimb >= 1500)
    bonus += 2;

  if (biggestClimb >= 2000)
    bonus += 3;

  const pils = Math.max(
    1,
    Math.round(
      distanceBeers +
      climbingBeers +
      bonus
    )
  );

  let tittel = "";

  if (pils <= 2)
    tittel = "Sofapils";

  else if (pils <= 4)
    tittel = "Torsdagspils";

  else if (pils <= 7)
    tittel = "Sykkelpils";

  else if (pils <= 10)
    tittel = "Fjellpils";

  else if (pils <= 15)
    tittel = "Monsterpils";

  else
    tittel = "Legendarisk pils";

  document.getElementById("resultat")
    .innerHTML = `

<h2>🍺 Resultat 🍺</h2>

<p>🚴 ${km.toFixed(1)} km</p>

<p>⛰️ ${Math.round(hm)} hm</p>

<p>🏔️ ${Math.round(biggestClimb)} hm største klatring</p>

<h3>Grunnlag</h3>

<p>• ${distanceBeers.toFixed(1)} pils fra distanse</p>

<p>• ${climbingBeers.toFixed(1)} pils fra høydemeter</p>

<p>• ${bonus.toFixed(1)} pils fra klatrebonus</p>

<h2>${pils} pils</h2>

<h3>🏆 ${tittel}</h3>

<p style="font-size:28px">
${"🍺".repeat(pils)}
</p>

<p>
<strong>DRIKK MED HJELM 🍺⛑️</strong>
</p>
`;
}

function findBiggestClimb(elevations) {

  const DESCENT_THRESHOLD = 30;

  let climbStart = elevations[0];
  let highest = elevations[0];

  let biggest = 0;

  for (let i = 1; i < elevations.length; i++) {

    const elev = elevations[i];

    if (elev > highest) {
      highest = elev;
    }

    if (
      highest - elev >
      DESCENT_THRESHOLD
    ) {

      const climb =
        highest - climbStart;

      if (climb > biggest) {
        biggest = climb;
      }

      climbStart = elev;
      highest = elev;
    }
  }

  const finalClimb =
    highest - climbStart;

  if (finalClimb > biggest) {
    biggest = finalClimb;
  }

  return biggest;
}

function haversine(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R = 6371;

  const dLat =
    (lat2 - lat1) *
    Math.PI / 180;

  const dLon =
    (lon2 - lon1) *
    Math.PI / 180;

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
