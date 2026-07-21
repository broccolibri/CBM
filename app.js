document
.getElementById("gpxFile")
.addEventListener("change", lesFil);

function lesFil(event) {

    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function(e) {

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