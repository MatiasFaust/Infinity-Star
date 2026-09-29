async function cargarInicio() {
    const d = await pedir("../../Api/traslados.php?tipo=contadores");

    const tarjetas = ["traslados", "pendientes", "confirmados", "curso", "finalizados", "ambulancias"];

    for (let i = 0; i < tarjetas.length; i++) {
        document.getElementById(tarjetas[i]).textContent = d[tarjetas[i]];
    }
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

async function llenarLista(select, url, valor, texto) {
    const lista = await pedir(url);

    ponerOpcion(select, "", "Elegir...");

    for (let i = 0; i < lista.length; i++) {
        ponerOpcion(select, lista[i][valor], texto(lista[i]));
    }

    return lista;
}

function textoAmbulancia(a) {
    return a.matricula + " - " + a.movil;
}

function textoPersona(p) {
    return p.apellido + ", " + p.nombre + " - " + p.cedula;
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

    const campos = ["origen", "origenLat", "origenLng", "destino", "destinoLat", "destinoLng", "minutos"];

    for (let i = 0; i < campos.length; i++) {
        document.getElementById(campos[i]).value = "";
    }

    document.getElementById("estimado").dataset.km = "";
    document.getElementById("estimado").hidden = true;
}

function mostrarEstimado() {
    const aviso = document.getElementById("estimado");

    if (!aviso || !aviso.dataset.km) {
        return;
    }

    aviso.textContent = enIdioma("Recorrido de") + " " + aviso.dataset.km + " km, " +
                        enIdioma("unos") + " " + aviso.dataset.min + " " + enIdioma("minutos de viaje.");
}

alCambiarIdioma.push(mostrarEstimado);

async function marcarPunto(mapa, lat, lng) {
    if (marcaOrigen && marcaDestino) {
        borrarMarcas(mapa);
    }

    if (!marcaOrigen) {
        marcaOrigen = L.marker([lat, lng]).addTo(mapa).bindPopup("Salida").openPopup();

        document.getElementById("origenLat").value = lat;
        document.getElementById("origenLng").value = lng;
        document.getElementById("origen").value = enIdioma("Buscando la dirección...");
        document.getElementById("origen").value = await nombreDelPunto(lat, lng);
        return;
    }

    marcaDestino = L.marker([lat, lng]).addTo(mapa).bindPopup("Llegada").openPopup();

    document.getElementById("destinoLat").value = lat;
    document.getElementById("destinoLng").value = lng;
    document.getElementById("destino").value = enIdioma("Buscando la dirección...");
    document.getElementById("destino").value = await nombreDelPunto(lat, lng);

    const desde = [Number(document.getElementById("origenLat").value), Number(document.getElementById("origenLng").value)];
    const info = await dibujarRuta(mapa, desde, [lat, lng]);

    lineaRuta = info.linea;

    document.getElementById("minutos").value = info.minutos;

    const aviso = document.getElementById("estimado");

    if (info.minutos > 0) {
        aviso.dataset.km = info.kilometros;
        aviso.dataset.min = info.minutos;
        mostrarEstimado();
    } else {
        aviso.dataset.km = "";
        aviso.textContent = enIdioma("No se pudo calcular la duración del recorrido.");
    }

    aviso.hidden = false;
}

async function cargarRegistroTraslado() {
    const mapa = crearMapa("mapa");

    mapa.on("click", function (evento) {
        marcarPunto(mapa, evento.latlng.lat, evento.latlng.lng);
    });

    const campoDireccion = document.getElementById("direccion");
    const botonBuscar = document.getElementById("buscarDireccion");

    async function irADireccion() {
        if (campoDireccion.value == "") {
            return;
        }

        botonBuscar.textContent = enIdioma("Buscando...");

        const lugar = await buscarDireccion(campoDireccion.value);

        botonBuscar.textContent = enIdioma("Buscar");

        if (!lugar) {
            const aviso = document.getElementById("estimado");
            aviso.dataset.km = "";
            aviso.textContent = enIdioma("No encontré esa dirección. Probá escribirla de otra forma o marcala en el mapa.");
            aviso.hidden = false;
            return;
        }

        mapa.setView([lugar.lat, lugar.lng], 16);

        await marcarPunto(mapa, lugar.lat, lugar.lng);

        campoDireccion.value = "";
    }

    botonBuscar.addEventListener("click", irADireccion);

    campoDireccion.addEventListener("keydown", function (evento) {
        if (evento.key == "Enter") {
            evento.preventDefault();
            irADireccion();
        }
    });

    document.getElementById("limpiar").addEventListener("click", function () {
        borrarMarcas(mapa);
    });

    await llenarLista(document.getElementById("ambulanciaRuta"), "../../Api/traslados.php?tipo=ambulancias", "idAmbulancia", textoAmbulancia);
    await llenarLista(document.getElementById("chofer"), "../../Api/traslados.php?tipo=choferes", "idFuncionario", textoPersona);
    await llenarLista(document.getElementById("paciente"), "../../Api/traslados.php?tipo=pacientes", "idPaciente", textoPersona);

    const queLleva = document.getElementById("queLleva");

    queLleva.addEventListener("change", function () {
        const llevaPaciente = queLleva.value == "paciente";

        document.getElementById("partePaciente").hidden = !llevaPaciente;
        document.getElementById("parteElemento").hidden = llevaPaciente;
    });

    const cedula = document.getElementById("copilotoCedula");

    cedula.addEventListener("input", function () {
        cedula.value = cedula.value.replace(/[^0-9]/g, "").substring(0, 8);
    });
}

if (document.getElementById("mapa") && document.getElementById("chofer")) {
    cargarRegistroTraslado();
}


function nombreCompleto(nombre, apellido) {
    if (!nombre) {
        return "-";
    }

    return nombre + " " + apellido;
}

function queSeTraslada(t) {
    if (t.nombrePaciente) {
        return t.nombrePaciente + " " + t.apellidoPaciente;
    }

    if (t.tipo) {
        if (t.descripcion) {
            return t.tipo + " (" + t.descripcion + ")";
        }

        return t.tipo;
    }

    return "-";
}

function horaOGuion(texto) {
    if (!texto) {
        return "-";
    }

    return fechaCorta(texto);
}

function dibujarTraslados(lista, texto) {
    const cuerpo = document.getElementById("cuerpoTraslados");
    cuerpo.innerHTML = "";

    const encontrados = filtrar(lista, texto, ["origen", "destino", "nombrePaciente", "apellidoPaciente",
                                               "nombreChofer", "apellidoChofer", "tipo", "estado", "movil"]);

    document.getElementById("vacio").hidden = encontrados.length > 0;

    for (let i = 0; i < encontrados.length; i++) {
        const t = encontrados[i];
        const fila = document.createElement("tr");

        fila.innerHTML =
            "<td>" + queSeTraslada(t) + "</td>" +
            "<td>" + t.origen + "</td>" +
            "<td>" + t.destino + "</td>" +
            "<td>" + t.movil + "</td>" +
            "<td>" + nombreCompleto(t.nombreChofer, t.apellidoChofer) + "</td>" +
            "<td>" + nombreCompleto(t.copilotoNombre, t.copilotoApellido) + "</td>" +
            "<td>" + horaOGuion(t.salida) + "</td>" +
            "<td>" + horaOGuion(t.llegada) + "</td>" +
            "<td>" + horaOGuion(t.llegadaReal) + "</td>" +
            "<td>" + t.estado + "</td>" +
            "<td>" + nombreCompleto(t.nombreAdmin, t.apellidoAdmin) + "</td>";

        cuerpo.appendChild(fila);
    }
}

async function cargarTraslados() {
    const lista = await pedir("../../Api/traslados.php?tipo=lista");

    dibujarTraslados(lista, "");

    const buscador = document.getElementById("buscarTraslado");

    buscador.addEventListener("input", function () {
        dibujarTraslados(lista, buscador.value);
    });
}

if (document.getElementById("cuerpoTraslados")) {
    cargarTraslados();
}
