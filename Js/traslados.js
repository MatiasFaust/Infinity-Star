async function cargarInicio() {
    const d = await pedir("../../Api/traslados.php?tipo=contadores");

    const tarjetas = ["traslados", "pendientes", "confirmados", "curso", "retorno", "finalizados", "ambulancias"];

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
            "<a class='editar' href='editarAmbulancia.html?id=" + a.idAmbulancia + "'>" + enIdioma("Editar") + "</a>" +
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
    opcion.textContent = enIdioma(texto);
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

async function trazarRuta(mapa) {
    if (lineaRuta) {
        mapa.removeLayer(lineaRuta);
        lineaRuta = null;
    }

    const desde = [Number(document.getElementById("origenLat").value),
                   Number(document.getElementById("origenLng").value)];

    const hasta = [Number(document.getElementById("destinoLat").value),
                   Number(document.getElementById("destinoLng").value)];

    const info = await dibujarRuta(mapa, desde, hasta);

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

async function ponerOrigen(mapa, lat, lng, texto) {
    if (marcaOrigen) {
        mapa.removeLayer(marcaOrigen);
    }

    marcaOrigen = L.marker([lat, lng]).addTo(mapa).bindPopup(enIdioma("Salida")).openPopup();

    document.getElementById("origenLat").value = lat;
    document.getElementById("origenLng").value = lng;

    if (texto) {
        document.getElementById("origen").value = texto;
    } else {
        document.getElementById("origen").value = enIdioma("Buscando la dirección...");
        document.getElementById("origen").value = await nombreDelPunto(lat, lng);
    }

    if (marcaDestino) {
        await trazarRuta(mapa);
    }

    guardarLoEscrito();
}

async function ponerDestino(mapa, lat, lng, texto) {
    if (marcaDestino) {
        mapa.removeLayer(marcaDestino);
    }

    marcaDestino = L.marker([lat, lng]).addTo(mapa).bindPopup(enIdioma("Llegada")).openPopup();

    document.getElementById("destinoLat").value = lat;
    document.getElementById("destinoLng").value = lng;

    if (texto) {
        document.getElementById("destino").value = texto;
    } else {
        document.getElementById("destino").value = enIdioma("Buscando la dirección...");
        document.getElementById("destino").value = await nombreDelPunto(lat, lng);
    }

    if (marcaOrigen) {
        await trazarRuta(mapa);
    }

    guardarLoEscrito();
}

async function marcarPunto(mapa, lat, lng) {
    if (marcaOrigen && marcaDestino) {
        borrarMarcas(mapa);
    }

    if (!marcaOrigen) {
        await ponerOrigen(mapa, lat, lng, "");
        return;
    }

    await ponerDestino(mapa, lat, lng, "");
}


// ---- Lo que quedó escrito sin guardar ----
// Si la persona llena el formulario y se va a otra pantalla, al volver
// le dejamos todo como estaba.

const camposDelTraslado = ["origen", "origenLat", "origenLng", "destino", "destinoLat", "destinoLng",
                           "minutos", "ambulancia", "chofer", "lleva", "paciente",
                           "tipoElemento", "descripcionElemento",
                           "copilotoNombre", "copilotoApellido", "copilotoCedula"];

function campoDelTraslado(nombre) {
    return document.querySelector("[name='" + nombre + "']");
}

function guardarLoEscrito() {
    const guardado = {};

    for (let i = 0; i < camposDelTraslado.length; i++) {
        const campo = campoDelTraslado(camposDelTraslado[i]);

        if (campo) {
            guardado[camposDelTraslado[i]] = campo.value;
        }
    }

    localStorage.setItem("trasladoAMedias", JSON.stringify(guardado));
}

function olvidarLoEscrito() {
    localStorage.removeItem("trasladoAMedias");
}

async function recordarLoEscrito(mapa) {
    let guardado = null;

    try {
        guardado = JSON.parse(localStorage.getItem("trasladoAMedias"));
    } catch (error) {
        guardado = null;
    }

    if (!guardado) {
        return;
    }

    for (let i = 0; i < camposDelTraslado.length; i++) {
        const nombre = camposDelTraslado[i];
        const campo = campoDelTraslado(nombre);

        if (campo && guardado[nombre]) {
            campo.value = guardado[nombre];
        }
    }

    const queLleva = document.getElementById("queLleva");
    const llevaPaciente = queLleva.value == "paciente";

    document.getElementById("partePaciente").hidden = !llevaPaciente;
    document.getElementById("parteElemento").hidden = llevaPaciente;

    // Volvemos a poner las marcas en el mapa si ya las había elegido.
    if (guardado.origenLat && guardado.origenLng) {
        marcaOrigen = L.marker([Number(guardado.origenLat), Number(guardado.origenLng)])
                        .addTo(mapa).bindPopup(enIdioma("Salida"));
    }

    if (guardado.destinoLat && guardado.destinoLng) {
        marcaDestino = L.marker([Number(guardado.destinoLat), Number(guardado.destinoLng)])
                         .addTo(mapa).bindPopup(enIdioma("Llegada"));
    }

    if (marcaOrigen && marcaDestino) {
        await trazarRuta(mapa);
        mapa.fitBounds([[Number(guardado.origenLat), Number(guardado.origenLng)],
                        [Number(guardado.destinoLat), Number(guardado.destinoLng)]], { padding: [40, 40] });
    } else if (marcaOrigen) {
        mapa.setView([Number(guardado.origenLat), Number(guardado.origenLng)], 15);
    }
}

async function cargarRegistroTraslado() {
    const mapa = crearMapa("mapa");

    mapa.on("click", function (evento) {
        marcarPunto(mapa, evento.latlng.lat, evento.latlng.lng);
    });

    // Cuando escriben una direccion en Origen o en Destino, la buscamos en el
    // mapa y dejamos el texto tal cual lo escribieron.
    async function buscarLoQueEscribio(cual) {
        const campo = document.getElementById(cual);
        const texto = campo.value.trim();

        if (texto == "") {
            return;
        }

        const aviso = document.getElementById("estimado");
        const lugar = await buscarDireccion(texto);

        if (!lugar) {
            aviso.dataset.km = "";
            aviso.textContent = enIdioma("No encontré esa dirección. Probá escribirla de otra forma o marcala en el mapa.");
            aviso.hidden = false;
            return;
        }

        if (cual == "origen") {
            await ponerOrigen(mapa, lugar.lat, lugar.lng, texto);
        } else {
            await ponerDestino(mapa, lugar.lat, lugar.lng, texto);
        }

        mapa.setView([lugar.lat, lugar.lng], 15);
    }

    const lugares = ["origen", "destino"];

    for (let i = 0; i < lugares.length; i++) {
        const cual = lugares[i];
        const campo = document.getElementById(cual);

        campo.addEventListener("keydown", function (evento) {
            if (evento.key == "Enter") {
                evento.preventDefault();
                buscarLoQueEscribio(cual);
            }
        });

        campo.addEventListener("blur", function () {
            buscarLoQueEscribio(cual);
        });
    }

    document.getElementById("limpiar").addEventListener("click", function () {
        borrarMarcas(mapa);
        guardarLoEscrito();
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

    const queEditar = new URLSearchParams(location.search).get("id");

    if (queEditar) {
        // Venimos de "Ver traslados" a corregir uno que ya existe.
        await abrirParaEditar(mapa, queEditar);
        return;
    }

    // Primero recuperamos lo que había quedado escrito, y recién después
    // empezamos a guardar, para no pisar lo viejo con campos vacíos.
    await recordarLoEscrito(mapa);

    for (let i = 0; i < camposDelTraslado.length; i++) {
        const campo = campoDelTraslado(camposDelTraslado[i]);

        if (campo) {
            campo.addEventListener("input", guardarLoEscrito);
            campo.addEventListener("change", guardarLoEscrito);
        }
    }

    // Si lo registra de verdad, ya no hace falta recordar nada.
    document.querySelector("form").addEventListener("submit", olvidarLoEscrito);
}

// Deja el formulario listo para modificar un traslado que ya está cargado.
async function abrirParaEditar(mapa, id) {
    const t = await pedir("../../Api/traslados.php?tipo=uno&id=" + id);

    if (!t || !t.idTraslado) {
        return;
    }

    const formulario = document.querySelector("form");

    formulario.setAttribute("action", "../../actualizar.php?que=traslado");
    document.getElementById("idTraslado").value = t.idTraslado;
    document.getElementById("guardarTraslado").textContent = enIdioma("Guardar cambios");
    document.querySelector("main h1").textContent = enIdioma("Editar traslado");

    document.getElementById("origen").value = t.origen;
    document.getElementById("origenLat").value = t.origenLat;
    document.getElementById("origenLng").value = t.origenLng;
    document.getElementById("destino").value = t.destino;
    document.getElementById("destinoLat").value = t.destinoLat;
    document.getElementById("destinoLng").value = t.destinoLng;
    document.getElementById("minutos").value = t.minutos;

    document.getElementById("ambulanciaRuta").value = t.idAmbulancia;
    document.getElementById("chofer").value = t.idChofer;

    const queLleva = document.getElementById("queLleva");

    if (t.idPaciente) {
        queLleva.value = "paciente";
        document.getElementById("paciente").value = t.idPaciente;
    } else {
        queLleva.value = "elemento";
        document.getElementById("tipoElemento").value = t.tipo || "";
        document.getElementById("descripcionElemento").value = t.descripcion || "";
    }

    document.getElementById("partePaciente").hidden = queLleva.value != "paciente";
    document.getElementById("parteElemento").hidden = queLleva.value == "paciente";

    campoDelTraslado("copilotoNombre").value = t.copilotoNombre || "";
    campoDelTraslado("copilotoApellido").value = t.copilotoApellido || "";
    campoDelTraslado("copilotoCedula").value = t.copilotoCedula || "";

    if (t.origenLat && t.destinoLat) {
        marcaOrigen = L.marker([Number(t.origenLat), Number(t.origenLng)]).addTo(mapa).bindPopup(enIdioma("Salida"));
        marcaDestino = L.marker([Number(t.destinoLat), Number(t.destinoLng)]).addTo(mapa).bindPopup(enIdioma("Llegada"));

        await trazarRuta(mapa);

        mapa.fitBounds([[Number(t.origenLat), Number(t.origenLng)],
                        [Number(t.destinoLat), Number(t.destinoLng)]], { padding: [40, 40] });
    }
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



// Deja solo los traslados que entran en el filtro de fecha y en el de estado.
function filtrarPorFiltros(lista) {
    const cuando = document.getElementById("filtroCuando").value;
    const estado = document.getElementById("filtroEstado").value;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const desde = new Date(hoy);

    if (cuando == "semana") {
        desde.setDate(desde.getDate() - 6);
    }

    const quedan = [];

    for (let i = 0; i < lista.length; i++) {
        const t = lista[i];

        if (estado != "" && t.estado != estado) {
            continue;
        }

        if (cuando != "todos") {
            if (!t.creado) {
                continue;
            }

            const fecha = new Date(t.creado.replace(" ", "T"));

            if (fecha < desde) {
                continue;
            }
        }

        quedan.push(t);
    }

    return quedan;
}

function dibujarTraslados(lista, texto) {
    const cuerpo = document.getElementById("cuerpoTraslados");
    cuerpo.innerHTML = "";

    const encontrados = filtrar(filtrarPorFiltros(lista), texto,
                                              ["origen", "destino", "nombrePaciente", "apellidoPaciente",
                                               "nombreChofer", "apellidoChofer", "copilotoNombre", "copilotoApellido",
                                               "nombreAdmin", "apellidoAdmin", "tipo", "descripcion",
                                               "estado", "movil", "matricula"]);

    document.getElementById("vacio").hidden = encontrados.length > 0;

    const cuantos = document.getElementById("cuantos");

    if (cuantos) {
        cuantos.textContent = encontrados.length + " " + enIdioma("de") + " " + lista.length;
    }

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
            "<td>" + enIdioma(t.estado) + "</td>" +
            "<td>" + nombreCompleto(t.nombreAdmin, t.apellidoAdmin) + "</td>" +
            "<td><a class='editar' href='registrarTraslado.html?id=" + t.idTraslado + "'>" +
            enIdioma("Editar") + "</a></td>";

        cuerpo.appendChild(fila);
    }
}

async function cargarTraslados() {
    const lista = await pedir("../../Api/traslados.php?tipo=lista");

    dibujarTraslados(lista, "");

    const buscador = document.getElementById("buscarTraslado");

    function volverADibujar() {
        dibujarTraslados(lista, buscador.value);
    }

    buscador.addEventListener("input", volverADibujar);
    document.getElementById("filtroCuando").addEventListener("change", volverADibujar);
    document.getElementById("filtroEstado").addEventListener("change", volverADibujar);
}

if (document.getElementById("cuerpoTraslados")) {
    cargarTraslados();
}
