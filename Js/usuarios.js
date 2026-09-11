function dibujarGrupo(rol, lista, texto) {
    const cuerpo = document.getElementById("cuerpo_" + rol);
    cuerpo.innerHTML = "";

    const encontrados = filtrar(lista, texto, ["nombre", "apellido", "cedula", "correo"]);

    if (encontrados.length == 0) {
        document.getElementById("vacio_" + rol).hidden = false;
    } else {
        document.getElementById("vacio_" + rol).hidden = true;
    }

    for (let i = 0; i < encontrados.length; i++) {
        const u = encontrados[i];

        let correo = "";
        if (u.correo) {
            correo = u.correo;
        }

        let direccion = "";
        if (u.direccion) {
            direccion = u.direccion;
        }

        let celdas = "<td>" + u.nombre + "</td>";
        celdas = celdas + "<td>" + u.apellido + "</td>";
        celdas = celdas + "<td>" + u.cedula + "</td>";
        celdas = celdas + "<td>" + correo + "</td>";
        celdas = celdas + "<td>" + direccion + "</td>";

        if (rol != "paciente") {
            let usuario = "";
            if (u.usuario) {
                usuario = u.usuario;
            }
            celdas = celdas + "<td>" + usuario + "</td>";
        }

        celdas = celdas + "<td>";
        celdas = celdas + "<a class='editar' href='editarUsuario.html?id=" + u.idPersona + "'>Editar</a>";
        celdas = celdas + botonAccion("borrar.php?que=persona", u.idPersona, "Eliminar", "eliminar", { vuelve: "usuarios.html", rol: rol });
        celdas = celdas + "</td>";

        const fila = document.createElement("tr");
        fila.innerHTML = celdas;
        cuerpo.appendChild(fila);
    }
}

async function cargarGrupo(rol) {
    const lista = await pedir("../../Api/usuarios.php?tipo=lista&rol=" + rol);

    dibujarGrupo(rol, lista, "");

    const buscador = document.getElementById("buscar_" + rol);

    buscador.addEventListener("input", function () {
        dibujarGrupo(rol, lista, buscador.value);
    });
}

function cargarLista() {
    cargarGrupo("paciente");
    cargarGrupo("administrativo");
    cargarGrupo("chofer");
}

async function cargarFormulario() {
    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
        location.href = "usuarios.html";
        return;
    }

    const u = await pedir("../../Api/usuarios.php?tipo=uno&id=" + id);

    if (!u) {
        location.href = "usuarios.html";
        return;
    }

    document.getElementById("id").value = u.idPersona;
    document.getElementById("rol").value = u.rol;
    document.getElementById("nombre").value = u.nombre;
    document.getElementById("apellido").value = u.apellido;
    document.getElementById("cedula").value = u.cedula;

    if (u.correo) {
        document.getElementById("correo").value = u.correo;
    }

    if (u.direccion) {
        document.getElementById("direccion").value = u.direccion;
    }
}

if (document.getElementById("cuerpo_paciente")) {
    cargarLista();
}

if (document.getElementById("id") && document.getElementById("rol")) {
    cargarFormulario();
}
