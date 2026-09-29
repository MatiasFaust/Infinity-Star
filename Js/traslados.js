
async function cargarInicio() {
    const d = await pedir("../../Api/traslados.php?tipo=contadores");
    document.getElementById("ambulancias").textContent = d.ambulancias;
    document.getElementById("rutas").textContent = d.rutas;
}


async function cargarAmbulancias() {
    const lista = await pedir("../../Api/traslados.php?tipo=ambulancias");
    const cuerpo = document.getElementById("cuerpoAmbulancias");

    if (lista.length == 0) {
        document.getElementById("vacio").hidden = false;
        return;
    }

    for (let i = 0; i < lista.length; i++) {
        const a = lista[i];
        const fila = document.createElement("tr");

        fila.innerHTML =
            "<td>" + a.matricula + "</td>" +
            "<td>" + a.movil + "</td>" +
            "<td>" +
            "<a class='editar' href='editarAmbulancia.html?id=" + a.idAmbulancia + "'>Editar</a>" +
            botonAccion("borrar.php?que=ambulancia", a.idAmbulancia, "Eliminar", "eliminar") +
            "</td>";

        cuerpo.appendChild(fila);
    }
}

async function cargarAmbulancia() {
    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
        location.href = "ambulancias.html";
        return;
    }

    const a = await pedir("../../Api/traslados.php?tipo=ambulancia&id=" + id);

    if (!a) {
        location.href = "ambulancias.html";
        return;
    }

    document.getElementById("id").value = a.idAmbulancia;
    document.getElementById("matricula").value = a.matricula;
    document.getElementById("movil").value = a.movil;
}

if (document.getElementById("ambulancias")) {
    cargarInicio();
}

if (document.getElementById("cuerpoAmbulancias")) {
    cargarAmbulancias();
}

if (document.getElementById("matricula") && document.getElementById("id")) {
    cargarAmbulancia();
}

function ponerOpcion(select, valor, texto) {
    const opcion = document.createElement("option");
    opcion.value = valor;
    opcion.textContent = texto;
    select.appendChild(opcion);
}

async function llenarAmbulancias(select) {
    const lista = await pedir("../../Api/traslados.php?tipo=ambulancias");

    ponerOpcion(select, "", "Elegir...");

    for (let i = 0; i < lista.length; i++) {
        ponerOpcion(select, lista[i].idAmbulancia, lista[i].matricula + " - " + lista[i].movil);
    }
}


let marcaOrigen = null;
let marcaDestino = null;
let lineaRuta = null;

function borrarMarcas(mapa) {
    if (marcaOrigen) {
        mapa.removeLayer(marcaOrigen);
        marcaOrigen = null;
    }

    if (marcaDestino) {
        mapa.removeLayer(marcaDestino);
        marcaDestino = null;
    }

    if (lineaRuta) {
        mapa.removeLayer(lineaRuta);
        lineaRuta = null;
    }

    const campos = ["origen", "origenLat", "origenLng", "destino", "destinoLat", "destinoLng"];

    for (let i = 0; i < campos.length; i++) {
        document.getElementById(campos[i]).value = "";
    }
}

async function marcarPunto(mapa, lat, lng) {
    if (marcaOrigen && marcaDestino) {
        borrarMarcas(mapa);
    }

    if (!marcaOrigen) {
        marcaOrigen = L.marker([lat, lng]).addTo(mapa).bindPopup("Salida").openPopup();

        document.getElementById("origenLat").value = lat;
        document.getElementById("origenLng").value = lng;
        document.getElementById("origen").value = "Buscando la dirección...";
        document.getElementById("origen").value = await nombreDelPunto(lat, lng);
        return;
    }

    marcaDestino = L.marker([lat, lng]).addTo(mapa).bindPopup("Llegada").openPopup();

    document.getElementById("destinoLat").value = lat;
    document.getElementById("destinoLng").value = lng;
    document.getElementById("destino").value = "Buscando la dirección...";
    document.getElementById("destino").value = await nombreDelPunto(lat, lng);

    const desde = [Number(document.getElementById("origenLat").value), Number(document.getElementById("origenLng").value)];

    lineaRuta = await dibujarRuta(mapa, desde, [lat, lng]);
}

async function cargarRutas() {
    const mapa = crearMapa("mapa");

    mapa.on("click", function (evento) {
        marcarPunto(mapa, evento.latlng.lat, evento.latlng.lng);
    });

    document.getElementById("limpiar").addEventListener("click", function () {
        borrarMarcas(mapa);
    });

    await llenarAmbulancias(document.getElementById("ambulanciaRuta"));

    const lista = await pedir("../../Api/traslados.php?tipo=rutas");
    const cuerpo = document.getElementById("cuerpoRutas");

    if (lista.length == 0) {
        document.getElementById("vacio").hidden = false;
        return;
    }

    for (let i = 0; i < lista.length; i++) {
        const r = lista[i];
        const fila = document.createElement("tr");

        fila.innerHTML =
            "<td>" + r.origen + "</td>" +
            "<td>" + r.destino + "</td>" +
            "<td>" + r.matricula + " - " + r.movil + "</td>" +
            "<td>" +
            botonAccion("borrar.php?que=ruta", r.idRuta, "Eliminar", "eliminar") +
            "</td>";

        cuerpo.appendChild(fila);
    }
}

if (document.getElementById("cuerpoRutas")) {
    cargarRutas();
}
