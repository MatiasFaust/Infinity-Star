function queSeTraslada(t) {
    if (t.nombrePaciente) {
        return t.nombrePaciente + " " + t.apellidoPaciente;
    }
    return t.descripcion;
}

async function cargarInicio() {
    const d = await pedir("../../Api/traslados.php?tipo=contadores");

    document.getElementById("total").textContent = d.total;
    document.getElementById("curso").textContent = d.curso;
    document.getElementById("retorno").textContent = d.retorno;
    document.getElementById("finalizados").textContent = d.finalizados;
    document.getElementById("ambulancias").textContent = d.ambulancias;
}

async function cargarLista() {
    const traslados = await pedir("../../Api/traslados.php?tipo=lista");
    const cuerpo = document.getElementById("cuerpoTraslados");

    if (traslados.length == 0) {
        document.getElementById("vacio").hidden = false;
        return;
    }

    for (let i = 0; i < traslados.length; i++) {
        const t = traslados[i];

        let chofer = "";
        if (t.nombreChofer) {
            chofer = t.nombreChofer + " " + t.apellidoChofer;
        }

        let matricula = "";
        if (t.matricula) {
            matricula = t.matricula;
        }

        let duracion = "";
        if (t.duracion != null) {
            duracion = aReloj(Number(t.duracion));
        }

        const fila = document.createElement("tr");

        fila.innerHTML =
            "<td>" + queSeTraslada(t) + "</td>" +
            "<td>" + t.tipo + "</td>" +
            "<td>" + t.origen + "</td>" +
            "<td>" + t.destino + "</td>" +
            "<td>" + fechaCorta(t.salida) + "</td>" +
            "<td>" + fechaCorta(t.llegada) + "</td>" +
            "<td>" + matricula + "</td>" +
            "<td>" + chofer + "</td>" +
            "<td class='" + colorEstado(t.estado) + "'>" + t.estado + "</td>" +
            "<td>" + duracion + "</td>" +
            "<td class='acciones'>" + botonAccion("borrar.php?que=traslado", t.idTraslado, "Eliminar", "eliminar") + "</td>";

        cuerpo.appendChild(fila);
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

if (document.getElementById("total")) {
    cargarInicio();
}

if (document.getElementById("cuerpoTraslados")) {
    cargarLista();
}

if (document.getElementById("cuerpoAmbulancias")) {
    cargarAmbulancias();
}

if (document.getElementById("matricula") && document.getElementById("id")) {
    cargarAmbulancia();
}
