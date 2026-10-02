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

    if (lista.permiso == 0) {
        location.replace("../../Index.html");
        return;
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
            acciones = "<a class='editar verActividad' href='#' data-id='" + f.idPersona + "' data-nombre='" + f.nombre + " " + f.apellido + "'>" + enIdioma("Ver actividad") + "</a>" +
                       botonEstado +
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

    const enlaces = document.querySelectorAll(".verActividad");

    for (let i = 0; i < enlaces.length; i++) {
        enlaces[i].addEventListener("click", function (evento) {
            evento.preventDefault();
            cargarActividad(this.dataset.id, this.dataset.nombre);
        });
    }
}

async function cargarFuncionarios() {
    const lista = await pedir("../../Api/superadmin.php?tipo=funcionarios");

    dibujarFuncionarios(lista, "");

    const buscador = document.getElementById("buscarFuncionario");

    buscador.addEventListener("input", function () {
        dibujarFuncionarios(lista, buscador.value);
    });
}

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
            "<td>" + a.accion + "</td>";

        cuerpo.appendChild(fila);
    }
}

if (document.getElementById("cuerpoFuncionarios")) {
    cargarTokens();
    cargarFuncionarios();
    cargarActividad("", "");

    document.getElementById("verTodo").addEventListener("click", function () {
        cargarActividad("", "");
    });
}
