document
    .getElementById("gpxFile")
    .addEventListener("change", lesFil);

function lesFil(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        const xmlText = e.target.result;

        const parser = new DOMParser();

        const xml = parser.parseFromString(
            xmlText,
            "application/xml"
        );

        analyser(xml);
    };

    reader.readAsText(file);
}

function analyser(xml) {

    const points =
        xml.getElementsByTagName("trkpt");

    if (points.length === 0) {

        document.getElementById("resultat")
            .innerHTML =
            "Fant ingen sporpunkter i GPX-filen.";

        return;
    }

    let elevations = [];

    for (let point of points) {

        const ele =
            point.getElementsByTagName("ele")[0];

        if (ele) {

            elevations.push(
                parseFloat(ele.textContent)
            );
        }
    }

    // Høydemeter

    let hm = 0;

    for (let i = 1; i < elevations.length; i++) {

        const diff =
            elevations[i] - elevations[i - 1];

        if (diff > 0) {
            hm += diff;
        }
    }

    // Kilometer

    let km = 0;

    for (let i = 1; i < points.length; i++) {

        const lat1 = parseFloat(
            points[i - 1].getAttribute("lat")
        );

        const lon1 = parseFloat(
            points[i - 1].getAttribute("lon")
        );

        const lat2 = parseFloat(
            points[i].getAttribute("lat")
        );

        const lon2 = parseFloat(
            points[i].getAttribute("lon")
        );

        km += haversine(
            lat1,
            lon1,
            lat2,
            lon2
        );
    }

    // Pilsberegning

    const distanceBeers = km / 35;

    const climbingBeers = hm / 800;

    let bonus = 0;

    if (hm >= 1000) bonus += 1;
    if (hm >= 2000) bonus += 2;
    if (hm >= 4000) bonus += 2;

    const pils = Math.max(
        1,
        Math.round(
            distanceBeers +
            climbingBeers +
            bonus
        )
    );

    document.getElementById("resultat")
        .innerHTML = `

<h2>🍺 Resultat 🍺</h2>

<p>🚴 ${km.toFixed(1)} km</p>

<p>⛰️ ${Math.round(hm)} høydemeter</p>

<h3>Grunnlag</h3>

<p>• ${distanceBeers.toFixed(1)} pils fra distanse</p>

<p>• ${climbingBeers.toFixed(1)} pils fra høydemeter</p>

<p>• ${bonus.toFixed(1)} pils fra klatrebonus</p>

<h2>${pils} pils</h2>

<p style="font-size:28px;">
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
