function queLleva(t) {
    if (t.nombrePaciente) {
        return t.nombrePaciente + " " + t.apellidoPaciente;
    }

    if (t.tipo) {
        return t.tipo;
    }

    return "-";
}

function botonDelEstado(t) {
    if (t.estado == "Pendiente") {
        return botonAccion("estado.php", t.idTraslado, "Confirmar", "editar", { accion: "confirmar" });
    }

    if (t.estado == "Confirmado") {
        return botonAccion("estado.php", t.idTraslado, "Iniciar traslado", "editar", { accion: "iniciar" });
    }

    if (t.estado == "En curso") {
        return botonAccion("estado.php", t.idTraslado, "Llegué al destino", "editar", { accion: "llegue" });
    }

    if (t.estado == "En retorno") {
        return botonAccion("estado.php", t.idTraslado, "Volví al hospital", "eliminar", { accion: "finalizar" });
    }

    return "";
}

function comoReloj(segundos) {
    if (segundos < 0) {
        segundos = 0;
    }

    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;

    let texto = minutos + ":";

    if (resto < 10) {
        texto = texto + "0";
    }

    return texto + resto;
}

function comoFecha(texto) {
    if (!texto) {
        return null;
    }

    return new Date(texto.replace(" ", "T"));
}

let viaje = null;

function actualizarContador() {
    if (!viaje) {
        return;
    }

    const ahora = new Date();
    const salida = comoFecha(viaje.salida);

    if (salida) {
        const pasados = Math.floor((ahora - salida) / 1000);
        document.getElementById("contador").textContent = comoReloj(pasados);
    }

    const llegada = comoFecha(viaje.llegada);

    // Si no quedó guardada la hora estimada, no mostramos nada en vez de
    // romper toda la pantalla.
    if (!llegada) {
        document.getElementById("restante").textContent = "";
        return;
    }

    const faltan = Math.floor((llegada - ahora) / 1000 / 60);

    if (faltan > 0) {
        document.getElementById("restante").textContent = enIdioma("Llegada estimada en") + " " + faltan + " " + enIdioma("minutos.");
    } else {
        document.getElementById("restante").textContent = enIdioma("Ya pasó la hora estimada de llegada.");
    }
}

function mapaDelTraslado(t) {
    return enlaceGoogleMaps(t.origenLat, t.origenLng, t.destinoLat, t.destinoLng);
}

function abrirMapaAlIniciar(lista) {
    const porId = {};

    for (let i = 0; i < lista.length; i++) {
        porId[lista[i].idTraslado] = lista[i];
    }

    const formularios = document.querySelectorAll("form.enLinea");

    for (let i = 0; i < formularios.length; i++) {
        const formulario = formularios[i];
        const accion = formulario.querySelector("input[name='accion']");
        const id = formulario.querySelector("input[name='id']");

        if (!accion || accion.value != "iniciar") {
            continue;
        }

        const t = porId[id.value];

        if (!t || !t.origenLat) {
            continue;
        }

        formulario.addEventListener("submit", function () {
            window.open(mapaDelTraslado(t), "_blank");
        });
    }
}

// Por defecto el chofer ve solo lo que tiene por hacer, asi no se le
// amontonan todos los viajes que ya termino.
function trasladosQueVe(lista) {
    const cual = document.getElementById("filtroMios").value;

    if (cual == "todos") {
        return lista;
    }

    const quedan = [];

    for (let i = 0; i < lista.length; i++) {
        const terminado = lista[i].estado == "Finalizado";

        if (cual == "hechos" && terminado) {
            quedan.push(lista[i]);
        }

        if (cual == "pendientes" && !terminado) {
            quedan.push(lista[i]);
        }
    }

    return quedan;
}

function dibujarMisTraslados(lista) {
    const cuerpo = document.getElementById("cuerpoMisTraslados");
    const visibles = trasladosQueVe(lista);

    cuerpo.innerHTML = "";

    document.getElementById("vacio").hidden = visibles.length > 0;

    const cuantos = document.getElementById("cuantosMios");

    if (cuantos) {
        cuantos.textContent = visibles.length + " " + enIdioma("de") + " " + lista.length;
    }

    for (let i = 0; i < visibles.length; i++) {
        const t = visibles[i];
        const fila = document.createElement("tr");

        let estimado = "-";

        if (t.minutos) {
            estimado = t.minutos + " min";
        }

        fila.innerHTML =
            "<td>" + queLleva(t) + "</td>" +
            "<td>" + t.origen + "</td>" +
            "<td>" + t.destino + "</td>" +
            "<td>" + t.movil + "</td>" +
            "<td>" + estimado + "</td>" +
            "<td>" + enIdioma(t.estado) + "</td>" +
            "<td>" + botonDelEstado(t) + "</td>";

        cuerpo.appendChild(fila);
    }
}

async function cargarMisTraslados() {
    const lista = await pedir("../../Api/traslados.php?tipo=mis");

    dibujarMisTraslados(lista);

    document.getElementById("filtroMios").addEventListener("change", function () {
        dibujarMisTraslados(lista);
    });

    for (let i = 0; i < lista.length; i++) {
        const t = lista[i];

        if ((t.estado == "En curso" || t.estado == "En retorno") && t.salida) {
            viaje = t;
        }
    }

    abrirMapaAlIniciar(lista);

    if (viaje) {
        document.getElementById("enViaje").hidden = false;
        document.getElementById("verMapa").href = mapaDelTraslado(viaje);

        actualizarContador();
        setInterval(actualizarContador, 1000);

        const mapa = crearMapa("mapa");
        const desde = [Number(viaje.origenLat), Number(viaje.origenLng)];
        const hasta = [Number(viaje.destinoLat), Number(viaje.destinoLng)];

        L.marker(desde).addTo(mapa).bindPopup(enIdioma("Salida"));
        L.marker(hasta).addTo(mapa).bindPopup(enIdioma("Llegada"));


        await dibujarRuta(mapa, desde, hasta);
    }
}

if (document.getElementById("cuerpoMisTraslados")) {
    cargarMisTraslados();
}



const segundosParaRecargar = 15;

function avisarQueSeActualiza() {
    const aviso = document.createElement("p");
    aviso.className = "ayuda avisoRecarga";
    // Va en partes separadas para que cada una se pueda traducir sola.
    const antes = document.createElement("span");
    antes.textContent = enIdioma("Esta pantalla se actualiza sola cada");

    const despues = document.createElement("span");
    despues.textContent = enIdioma("segundos.");

    aviso.append(antes, " " + segundosParaRecargar + " ", despues);

    const titulo = document.querySelector("main h1");

    if (titulo) {
        titulo.after(aviso);
    }
}

function recargarSolo() {
    setTimeout(function () {
        location.reload();
    }, segundosParaRecargar * 1000);
}

if (document.getElementById("cuerpoMisTraslados")) {
    avisarQueSeActualiza();
    recargarSolo();
}
