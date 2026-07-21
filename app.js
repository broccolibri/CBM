
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

    let hm = 0;

    for (let i = 1; i < elevations.length; i++) {

        const diff =
            elevations[i] - elevations[i - 1];

        if (diff > 0) {
            hm += diff;
        }
    }

    const pils = Math.max(
        1,
        Math.round(hm / 800)
    );

    document.getElementById("resultat")
        .innerHTML = `

<h2>🍺 Resultat 🍺</h2>

<p>⛰️ ${Math.round(hm)} høydemeter</p>

<p><strong>${pils} pils</strong></p>

<p>${"🍺".repeat(pils)}</p>

<p><strong>DRIKK MED HJELM 🍺⛑️</strong></p>

`;
}
