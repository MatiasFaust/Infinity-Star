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

async function buscarCamino(desde, hasta) {
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

            return {
                camino: camino,
                minutos: Math.round(datos.routes[0].duration / 60),
                kilometros: Math.round(datos.routes[0].distance / 100) / 10
            };
        }
    } catch (error) {
        console.log("No se pudo calcular el camino, dibujo la línea recta.");
    }

    return { camino: [desde, hasta], minutos: 0, kilometros: 0 };
}

async function dibujarRuta(mapa, desde, hasta) {
    const info = await buscarCamino(desde, hasta);

    info.linea = L.polyline(info.camino, { color: "green", weight: 5 }).addTo(mapa);

    mapa.fitBounds(info.linea.getBounds(), { padding: [30, 30] });

    return info;
}

async function buscarDireccion(texto) {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=uy&q=" + encodeURIComponent(texto);

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.length > 0) {
            return {
                lat: Number(datos[0].lat),
                lng: Number(datos[0].lon),
                nombre: datos[0].display_name
            };
        }
    } catch (error) {
        console.log("No se pudo buscar la dirección.");
    }

    return null;
}

function enlaceGoogleMaps(origenLat, origenLng, destinoLat, destinoLng) {
    return "https://www.google.com/maps/dir/?api=1" +
           "&origin=" + origenLat + "," + origenLng +
           "&destination=" + destinoLat + "," + destinoLng +
           "&travelmode=driving";
}
