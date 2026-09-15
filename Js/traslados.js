
async function cargarInicio() {
    const d = await pedir("../../Api/traslados.php?tipo=contadores");
    document.getElementById("ambulancias").textContent = d.ambulancias;
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
