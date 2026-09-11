

function dibujarGrupo(rol, lista, texto) {
    const cuerpo = document.getElementById("cuerpo_" + rol);
    cuerpo.innerHTML = "";

    const encontrados = filtrar(lista, texto, ["nombre", "apellido", "cedula", "correo"]);

    document.getElementById("vacio_" + rol).hidden = encontrados.length > 0;

    for (const u of encontrados) {
        let celdas =
            "<td>" + u.nombre + "</td>" +
            "<td>" + u.apellido + "</td>" +
            "<td>" + u.cedula + "</td>" +
            "<td>" + (u.correo || "") + "</td>" +
            "<td>" + (u.direccion || "") + "</td>";

        
        if (rol !== "paciente") {
            celdas += "<td>" + (u.usuario || "") + "</td>";
        }

        celdas +=
            "<td>" +
            "<a class='editar' href='editarUsuario.html?id=" + u.idPersona + "'>Editar</a>" +
            botonAccion("borrar.php?que=persona", u.idPersona, "Eliminar", "eliminar",
                        { vuelve: "usuarios.html", rol: rol }) +
            "</td>";

        const fila = document.createElement("tr");
        fila.innerHTML = celdas;
        cuerpo.appendChild(fila);
    }
}

async function cargarLista() {
    for (const rol of ["paciente", "administrativo", "chofer"]) {
        const lista = await pedir("../../Api/usuarios.php?tipo=lista&rol=" + rol);

        dibujarGrupo(rol, lista, "");

        document.getElementById("buscar_" + rol)
                .addEventListener("input", function () { dibujarGrupo(rol, lista, this.value); });
    }
}

async function cargarFormulario() {
    const id = new URLSearchParams(location.search).get("id");

    if (!id) { location.href = "usuarios.html"; return; }

    const u = await pedir("../../Api/usuarios.php?tipo=uno&id=" + id);

    if (!u) { location.href = "usuarios.html"; return; }

    document.getElementById("id").value = u.idPersona;

    for (const campo of ["rol", "nombre", "apellido", "cedula", "correo", "direccion"]) {
        document.getElementById(campo).value = u[campo] || "";
    }
}

if (document.getElementById("cuerpo_paciente")) { cargarLista(); }
if (document.getElementById("id") && document.getElementById("rol")) { cargarFormulario(); }
