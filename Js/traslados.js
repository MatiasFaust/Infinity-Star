
async function cargarInicio() {
    const d = await pedir("../../Api/traslados.php?tipo=contadores");
    document.getElementById("ambulancias").textContent = d.ambulancias;
    document.getElementById("rutas").textContent = d.rutas;
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


const departamentos = [
    "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno",
    "Flores", "Florida", "Lavalleja", "Maldonado", "Montevideo",
    "Paysandú", "Río Negro", "Rivera", "Rocha", "Salto",
    "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
];

function ponerOpcion(select, valor, texto) {
    const opcion = document.createElement("option");
    opcion.value = valor;
    opcion.textContent = texto;
    select.appendChild(opcion);
}

function llenarDepartamentos(select) {
    ponerOpcion(select, "", "Elegir...");

    for (let i = 0; i < departamentos.length; i++) {
        ponerOpcion(select, departamentos[i], departamentos[i]);
    }
}

async function llenarAmbulancias(select) {
    const lista = await pedir("../../Api/traslados.php?tipo=ambulancias");

    ponerOpcion(select, "", "Elegir...");

    for (let i = 0; i < lista.length; i++) {
        ponerOpcion(select, lista[i].idAmbulancia, lista[i].matricula + " - " + lista[i].movil);
    }
}

async function cargarRutas() {
    llenarDepartamentos(document.getElementById("origen"));
    llenarDepartamentos(document.getElementById("destino"));
    await llenarAmbulancias(document.getElementById("ambulanciaRuta"));

    const lista = await pedir("../../Api/traslados.php?tipo=rutas");
    const cuerpo = document.getElementById("cuerpoRutas");

    if (lista.length == 0) {
        document.getElementById("vacio").hidden = false;
        return;
    }

    for (let i = 0; i < lista.length; i++) {
        const r = lista[i];
        const fila = document.createElement("tr");

        fila.innerHTML =
            "<td>" + r.origen + "</td>" +
            "<td>" + r.destino + "</td>" +
            "<td>" + r.matricula + " - " + r.movil + "</td>" +
            "<td>" +
            botonAccion("borrar.php?que=ruta", r.idRuta, "Eliminar", "eliminar") +
            "</td>";

        cuerpo.appendChild(fila);
    }
}

if (document.getElementById("cuerpoRutas")) {
    cargarRutas();
}
