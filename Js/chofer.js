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
        return botonAccion("estado.php", t.idTraslado, "Finalizar", "eliminar", { accion: "finalizar" });
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
    return new Date(texto.replace(" ", "T"));
}

let viaje = null;

function actualizarContador() {
    if (!viaje) {
        return;
    }

    const ahora = new Date();
    const salida = comoFecha(viaje.salida);
    const pasados = Math.floor((ahora - salida) / 1000);

    document.getElementById("contador").textContent = comoReloj(pasados);

    const llegada = comoFecha(viaje.llegada);
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

async function cargarMisTraslados() {
    const lista = await pedir("../../Api/traslados.php?tipo=mis");
    const cuerpo = document.getElementById("cuerpoMisTraslados");

    if (lista.length == 0) {
        document.getElementById("vacio").hidden = false;
        return;
    }

    for (let i = 0; i < lista.length; i++) {
        const t = lista[i];
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

        if (t.estado == "En curso" && t.salida) {
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

        prepararBotonUbicacion();

        await dibujarRuta(mapa, desde, hasta);
    }
}

if (document.getElementById("cuerpoMisTraslados")) {
    cargarMisTraslados();
}


const segundosEntreAvisos = 20;

let vigilancia = null;
let ultimoEnvio = 0;

function mostrarAvisoUbicacion(texto) {
    const aviso = document.getElementById("avisoUbicacion");
    aviso.textContent = texto;
    aviso.hidden = false;
}

async function mandarUbicacion(lat, lng) {
    const datos = new FormData();
    datos.append("id", viaje.idTraslado);
    datos.append("latitud", lat);
    datos.append("longitud", lng);

    const respuesta = await fetch("../../ubicacion.php", { method: "POST", body: datos });
    const r = await respuesta.json();

    if (r.ok == 1) {
        mostrarAvisoUbicacion(enIdioma("Compartiendo ubicación") + " · " + enIdioma("último aviso") + " " + r.momento);
    } else {
        mostrarAvisoUbicacion(enIdioma("No se pudo enviar la ubicación."));
    }
}

function alMoverse(pos) {
    const ahora = Date.now();

    if (ahora - ultimoEnvio < segundosEntreAvisos * 1000) {
        return;
    }

    ultimoEnvio = ahora;

    mandarUbicacion(pos.coords.latitude, pos.coords.longitude);
}

function alFallar() {
    mostrarAvisoUbicacion(enIdioma("No diste permiso para usar la ubicación, o la página no es segura (https)."));
    apagarUbicacion();
}

function ponerTextoBoton(prendido) {
    const boton = document.getElementById("compartirUbicacion");

    if (prendido) {
        boton.textContent = enIdioma("Dejar de compartir");
    } else {
        boton.textContent = enIdioma("Compartir mi ubicación");
    }
}

function prenderUbicacion() {
    if (!navigator.geolocation) {
        mostrarAvisoUbicacion(enIdioma("Este navegador no puede dar la ubicación."));
        return;
    }

    ultimoEnvio = 0;

    vigilancia = navigator.geolocation.watchPosition(alMoverse, alFallar, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000
    });

    localStorage.setItem("compartirUbicacion", "si");
    ponerTextoBoton(true);
    mostrarAvisoUbicacion(enIdioma("Buscando la ubicación..."));
}

function apagarUbicacion() {
    if (vigilancia != null) {
        navigator.geolocation.clearWatch(vigilancia);
        vigilancia = null;
    }

    localStorage.setItem("compartirUbicacion", "no");
    ponerTextoBoton(false);
}

function prepararBotonUbicacion() {
    const boton = document.getElementById("compartirUbicacion");

    if (!boton || !viaje) {
        return;
    }

    boton.addEventListener("click", function () {
        if (vigilancia == null) {
            prenderUbicacion();
        } else {
            apagarUbicacion();
            mostrarAvisoUbicacion(enIdioma("Dejaste de compartir tu ubicación."));
        }
    });

    if (localStorage.getItem("compartirUbicacion") == "si") {
        prenderUbicacion();
    } else {
        ponerTextoBoton(false);
    }
}
