function botonSuper(accion, id, texto, clase, extra) {
    let campos = "<input type='hidden' name='accion' value='" + accion + "'>";
    campos = campos + "<input type='hidden' name='id' value='" + id + "'>";

    if (extra) {
        for (const nombre in extra) {
            campos = campos + "<input type='hidden' name='" + nombre + "' value='" + extra[nombre] + "'>";
        }
    }

    let html = "<form class='enLinea' method='POST' action='../../super.php'>";
    html = html + campos;
    html = html + "<button type='submit' class='" + clase + "'>" + enIdioma(texto) + "</button>";
    html = html + "</form>";

    return html;
}


function nombreDeLaAccion(accion) {
    if (accion == "registrarPaciente") { return "Registrar un paciente"; }
    if (accion == "registrarAdministrativo") { return "Registrar un administrativo"; }
    if (accion == "registrarChofer") { return "Registrar un chofer"; }
    if (accion == "eliminarPersona") { return "Eliminar una persona"; }
    if (accion == "editarAmbulancia") { return "Editar una ambulancia"; }
    if (accion == "eliminarAmbulancia") { return "Eliminar una ambulancia"; }
    if (accion == "eliminarDocumento") { return "Eliminar un documento"; }
    if (accion == "editarPersona") { return "Editar una persona"; }

    return accion;
}

async function cargarTokens() {
    const lista = await pedir("../../Api/superadmin.php?tipo=tokens");

    // Si no es superadmin no cargamos nada. De mandarlo a su pantalla
    // se encarga el control de roles que esta en comun.js.
    if (lista.permiso == 0) {
        return 0;
    }

    const cuerpo = document.getElementById("cuerpoTokens");
    cuerpo.innerHTML = "";

    for (let i = 0; i < lista.length; i++) {
        const t = lista[i];
        const fila = document.createElement("tr");

        fila.innerHTML =
            "<td>" + enIdioma(nombreDeLaAccion(t.accion)) + "</td>" +
            "<td>" +
            "<form class='enLinea' method='POST' action='../../super.php'>" +
            "<input type='hidden' name='accion' value='guardarToken'>" +
            "<input type='hidden' name='id' value='" + t.idToken + "'>" +
            "<input type='text' name='codigo' value='" + t.codigo + "' required>" +
            "<button type='submit' class='editar'>" + enIdioma("Guardar") + "</button>" +
            "</form>" +
            "</td>";

        cuerpo.appendChild(fila);
    }

    return lista.length;
}

function formularioDeClave(idPersona) {
    let html = "<form class='enLinea' method='POST' action='../../super.php'>";
    html = html + "<input type='hidden' name='accion' value='ponerClave'>";
    html = html + "<input type='hidden' name='id' value='" + idPersona + "'>";
    html = html + "<input type='password' name='nueva' placeholder='" + enIdioma("Clave nueva") + "' minlength='8' maxlength='16' pattern='(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{8,16}' title='" + enIdioma("De 8 a 16 letras y números con al menos una mayúscula y un número") + "' required>";
    html = html + "<button type='submit' class='editar'>" + enIdioma("Poner clave") + "</button>";
    html = html + "</form>";

    return html;
}

function dibujarFuncionarios(lista, texto) {
    const cuerpo = document.getElementById("cuerpoFuncionarios");
    cuerpo.innerHTML = "";

    const encontrados = filtrar(lista, texto, ["nombre", "apellido", "cedula", "usuario", "roles"]);

    document.getElementById("vacioFuncionarios").hidden = encontrados.length > 0;

    for (let i = 0; i < encontrados.length; i++) {
        const f = encontrados[i];
        const fila = document.createElement("tr");

        let estado = "<span class='estadoActivo'>" + enIdioma("Activo") + "</span>";
        let botonEstado = botonSuper("suspender", f.idPersona, "Suspender", "eliminar", { valor: 1 });

        if (f.suspendido == 1) {
            estado = "<span class='estadoSuspendido'>" + enIdioma("Suspendido") + "</span>";
            botonEstado = botonSuper("suspender", f.idPersona, "Reactivar", "editar", { valor: 0 });
        }

        let acciones = "";

        if (f.roles == "superadmin") {
            estado = "<span class='estadoActivo'>" + enIdioma("Activo") + "</span>";
            acciones = "<span class='ayuda'>" + enIdioma("Es tu cuenta") + "</span>";
        } else {
            acciones = botonEstado +
                       formularioDeClave(f.idPersona) +
                       botonSuper("eliminar", f.idPersona, "Eliminar", "eliminar");
        }

        let usuario = "-";
        if (f.usuario) { usuario = f.usuario; }

        fila.innerHTML =
            "<td>" + f.nombre + " " + f.apellido + "</td>" +
            "<td>" + f.cedula + "</td>" +
            "<td>" + usuario + "</td>" +
            "<td>" + f.roles + "</td>" +
            "<td>" + estado + "</td>" +
            "<td>" + f.movimientos + "</td>" +
            "<td>" + horaOGuion(f.ultimoMomento) + "</td>" +
            "<td>" + acciones + "</td>";

        cuerpo.appendChild(fila);
    }

}

async function cargarFuncionarios() {
    const lista = await pedir("../../Api/superadmin.php?tipo=funcionarios");

    dibujarFuncionarios(lista, "");

    const buscador = document.getElementById("buscarFuncionario");

    buscador.addEventListener("input", function () {
        dibujarFuncionarios(lista, buscador.value);
    });

    return lista;
}

// ---- El historial en inglés ----
// Cada movimiento se guarda en español y con nombres adentro ("Suspendió a
// Juan Pérez"), así que no se puede buscar entero en traducciones.json.
// Acá se traduce la parte fija y se deja igual el nombre.

const rolEnIngles = { paciente: "patient", administrativo: "administrative staff", chofer: "driver" };
const registroEnIngles = { persona: "person", docPaciente: "patient document", documento: "document", enlaceQr: "QR link", ambulancia: "ambulance" };

const accionesEnIngles = [
    [/^Inició sesión$/, function () { return "Logged in"; }],
    [/^Cambió su contraseña$/, function () { return "Changed their password"; }],
    [/^Pidió recuperar su usuario y se le generó una contraseña nueva$/, function () { return "Asked to recover their account and got a new password"; }],
    [/^Le puso una contraseña nueva a (.*)$/, function (m) { return "Set a new password for " + m[1]; }],
    [/^Suspendió a (.*)$/, function (m) { return "Suspended " + m[1]; }],
    [/^Reactivó a (.*)$/, function (m) { return "Reactivated " + m[1]; }],
    [/^Eliminó a (.*)$/, function (m) { return "Deleted " + m[1]; }],
    [/^Eliminó un registro \((.*)\)$/, function (m) { return "Deleted a record (" + (registroEnIngles[m[1]] || m[1]) + ")"; }],
    [/^Registró o editó a (.*) \((.*)\)$/, function (m) { return "Registered or edited " + m[1] + " (" + (rolEnIngles[m[2]] || m[2]) + ")"; }],
    [/^Registró un traslado de (.*) a (.*)$/, function (m) { return "Registered a transfer from " + m[1] + " to " + m[2]; }],
    [/^Modificó el traslado (.*)$/, function (m) { return "Edited transfer " + m[1]; }],
    [/^Confirmó el traslado (.*)$/, function (m) { return "Confirmed transfer " + m[1]; }],
    [/^Salió con el traslado (.*)$/, function (m) { return "Left with transfer " + m[1]; }],
    [/^Llegó al destino del traslado (.*)$/, function (m) { return "Reached the destination of transfer " + m[1]; }],
    [/^Volvió al hospital con el traslado (.*)$/, function (m) { return "Returned to the hospital with transfer " + m[1]; }],
    [/^Agregó la ambulancia (.*)$/, function (m) { return "Added ambulance " + m[1]; }],
    [/^Agregó el QR (.*)$/, function (m) { return "Added QR " + m[1]; }],
    [/^Cambió el QR (.*)$/, function (m) { return "Changed QR " + m[1]; }],
    [/^Cambió el token de (.*)$/, function (m) { return "Changed the token for " + enIdioma(nombreDeLaAccion(m[1])); }],
    [/^Subió el documento (.*)$/, function (m) { return "Uploaded document " + m[1]; }],
    [/^Sustituyó el archivo del documento (.*)$/, function (m) { return "Replaced the file of document " + m[1]; }]
];

function accionEnIdioma(accion) {
    if (localStorage.getItem("idioma") != "en") {
        return accion;
    }

    for (let i = 0; i < accionesEnIngles.length; i++) {
        const encontrado = accion.match(accionesEnIngles[i][0]);

        if (encontrado) {
            return accionesEnIngles[i][1](encontrado);
        }
    }

    return accion;
}

// Al apretar el botón de idioma se vuelven a escribir los movimientos.
alCambiarIdioma.push(function () {
    const celdas = document.querySelectorAll("td[data-accion]");

    for (let i = 0; i < celdas.length; i++) {
        celdas[i].textContent = accionEnIdioma(celdas[i].dataset.accion);
    }
});

async function cargarActividad(id, nombre) {
    let url = "../../Api/superadmin.php?tipo=actividad";

    if (id) {
        url = url + "&id=" + id;
        document.getElementById("tituloActividad").textContent = enIdioma("Qué hizo") + " " + nombre;
        document.getElementById("ayudaActividad").hidden = true;
    } else {
        document.getElementById("tituloActividad").textContent = enIdioma("Qué hizo cada funcionario");
        document.getElementById("ayudaActividad").hidden = false;
    }

    const lista = await pedir(url);
    const cuerpo = document.getElementById("cuerpoActividad");
    cuerpo.innerHTML = "";

    document.getElementById("vacioActividad").hidden = lista.length > 0;

    for (let i = 0; i < lista.length; i++) {
        const a = lista[i];
        const fila = document.createElement("tr");

        let quien = enIdioma("Cuenta eliminada");

        if (a.nombre) {
            quien = a.nombre + " " + a.apellido;
        }

        fila.innerHTML =
            "<td>" + fechaCorta(a.momento) + "</td>" +
            "<td>" + quien + "</td>" +
            "<td></td>";

        // Se guarda en español para poder volver a traducirlo.
        fila.lastChild.dataset.accion = a.accion;
        fila.lastChild.textContent = accionEnIdioma(a.accion);

        cuerpo.appendChild(fila);
    }

    return lista;
}

// ---- Las partes del panel ----
// Muestra una sola por vez y se acuerda en cuál estabas, así cuando guardás
// algo y la página se recarga volvés al mismo lugar y no al principio.

function mostrarParte(cual) {
    const partes = document.querySelectorAll(".parte");

    for (let i = 0; i < partes.length; i++) {
        partes[i].hidden = (partes[i].id != "parte" + cual.charAt(0).toUpperCase() + cual.slice(1));
    }

    const botones = document.querySelectorAll(".pestana[data-parte]");

    for (let i = 0; i < botones.length; i++) {
        botones[i].classList.toggle("elegida", botones[i].dataset.parte == cual);
    }

    localStorage.setItem("parteSuper", cual);
}

function prepararPartes() {
    const botones = document.querySelectorAll(".pestana[data-parte]");

    for (let i = 0; i < botones.length; i++) {
        const boton = botones[i];

        boton.addEventListener("click", function () {
            mostrarParte(boton.dataset.parte);
        });
    }

    mostrarParte(localStorage.getItem("parteSuper") || "inicio");
}

// Los numeritos y los últimos movimientos del inicio.
function llenarResumen(funcionarios, tokens, actividad) {
    let admin = 0;
    let choferes = 0;
    let suspendidos = 0;

    for (let i = 0; i < funcionarios.length; i++) {
        const roles = funcionarios[i].roles || "";

        if (roles.indexOf("chofer") != -1) {
            choferes = choferes + 1;
        } else if (roles.indexOf("administrativo") != -1) {
            admin = admin + 1;
        }

        if (funcionarios[i].suspendido == 1) {
            suspendidos = suspendidos + 1;
        }
    }

    document.getElementById("cuentaAdmin").textContent = admin;
    document.getElementById("cuentaChoferes").textContent = choferes;
    document.getElementById("cuentaSuspendidos").textContent = suspendidos;
    document.getElementById("cuentaTokens").textContent = tokens;
    document.getElementById("cuentaMovimientos").textContent = actividad.length;

    const cuerpo = document.getElementById("cuerpoUltimos");
    cuerpo.innerHTML = "";

    for (let i = 0; i < actividad.length && i < 5; i++) {
        const a = actividad[i];
        const fila = document.createElement("tr");

        let quien = enIdioma("Cuenta eliminada");

        if (a.nombre) {
            quien = a.nombre + " " + a.apellido;
        }

        fila.innerHTML =
            "<td>" + fechaCorta(a.momento) + "</td>" +
            "<td>" + quien + "</td>" +
            "<td></td>";

        // Se guarda en español para poder volver a traducirlo.
        fila.lastChild.dataset.accion = a.accion;
        fila.lastChild.textContent = accionEnIdioma(a.accion);

        cuerpo.appendChild(fila);
    }
}

async function cargarPanelSuper() {
    prepararPartes();

    const tokens = await cargarTokens();
    const funcionarios = await cargarFuncionarios();
    const actividad = await cargarActividad("", "");

    llenarResumen(funcionarios, tokens, actividad);

    document.getElementById("verTodo").addEventListener("click", function () {
        cargarActividad("", "");
    });
}

if (document.getElementById("cuerpoFuncionarios")) {
    cargarPanelSuper();
}
