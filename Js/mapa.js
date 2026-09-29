const centroUruguay = [-34.9011, -56.1645];

function crearMapa(id) {
    const mapa = L.map(id, { scrollWheelZoom: false }).setView(centroUruguay, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19
    }).addTo(mapa);

    return mapa;
}

async function nombreDelPunto(lat, lng) {
    const url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.display_name) {
            return datos.display_name;
        }
    } catch (error) {
        console.log("No se pudo buscar la dirección, uso las coordenadas.");
    }

    return lat.toFixed(5) + ", " + lng.toFixed(5);
}

async function caminoPorCalles(desde, hasta) {
    const puntos = desde[1] + "," + desde[0] + ";" + hasta[1] + "," + hasta[0];
    const url = "https://router.project-osrm.org/route/v1/driving/" + puntos + "?overview=full&geometries=geojson";

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.routes && datos.routes.length > 0) {
            const crudo = datos.routes[0].geometry.coordinates;
            const camino = [];

            for (let i = 0; i < crudo.length; i++) {
                camino.push([crudo[i][1], crudo[i][0]]);
            }

            return camino;
        }
    } catch (error) {
        console.log("No se pudo calcular el camino, dibujo la línea recta.");
    }

    return [desde, hasta];
}

async function dibujarRuta(mapa, desde, hasta) {
    const camino = await caminoPorCalles(desde, hasta);
    const linea = L.polyline(camino, { color: "green", weight: 5 }).addTo(mapa);

    mapa.fitBounds(linea.getBounds(), { padding: [30, 30] });

    return linea;
}
