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

    // Totale høydemeter

    let hm = 0;

    for (let i = 1; i < elevations.length; i++) {

        const diff =
            elevations[i] - elevations[i - 1];

        if (diff > 0) {
            hm += diff;
        }
    }

    // Distanse

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

    // Finn klatringer

    const climbs =
        findClimbs(elevations);

    const biggestClimb =
        climbs.length > 0
            ? Math.max(...climbs)
            : 0;

    // Pilsberegning

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

    // Klatringsliste

    let climbText = "";

    if (climbs.length > 0) {

        const sortedClimbs =
            [...climbs].sort((a, b) => b - a);

        for (const climb of sortedClimbs) {
            climbText +=
                `🏔️ ${Math.round(climb)} hm<br>`;
        }

    } else {

        climbText =
            "Ingen store klatringer funnet";
    }

    document.getElementById("resultat")
