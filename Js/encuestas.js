let cuantasPreguntas = 0;

function agregarPregunta(texto) {
    cuantasPreguntas = cuantasPreguntas + 1;

    const fila = document.createElement("div");
    fila.className = "fila";

    const campo = document.createElement("input");
    campo.type = "text";
    campo.name = "pregunta" + cuantasPreguntas;
    campo.placeholder = enIdioma("Pregunta") + " " + cuantasPreguntas;

    if (texto) {
        campo.value = texto;
    }

    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "eliminar";
    quitar.textContent = enIdioma("Quitar");

    quitar.addEventListener("click", function () {
        fila.remove();
    });

    fila.appendChild(campo);
    fila.appendChild(quitar);

    document.getElementById("preguntas").appendChild(fila);
}

async function cargarEncuestas() {
    const lista = await pedir("../../Api/documentos.php?tipo=encuestas");
    const cuerpo = document.getElementById("cuerpoEncuestas");

    cuerpo.innerHTML = "";

    if (lista.length == 0) {
        document.getElementById("vacio").hidden = false;
        return;
    }

    document.getElementById("vacio").hidden = true;

    for (let i = 0; i < lista.length; i++) {
        const e = lista[i];
        const fila = document.createElement("tr");

        fila.innerHTML =
            "<td>" + e.titulo + "</td>" +
            "<td>" + e.preguntas + "</td>" +
            "<td>" + e.respondieron + "</td>" +
            "<td>" + fechaCorta(e.fecha) + "</td>" +
            "<td>" +
            "<a class='editar' href='../../encuesta.html?id=" + e.idEncuesta + "'>" + enIdioma("Abrir") + "</a>" +
            botonAccion("borrar.php?que=encuesta", e.idEncuesta, "Eliminar", "eliminar") +
            "</td>";

        cuerpo.appendChild(fila);
    }
}

if (document.getElementById("preguntas")) {
    agregarPregunta();
    agregarPregunta();
    agregarPregunta();

    document.getElementById("agregarPregunta").addEventListener("click", function () {
        agregarPregunta();
    });

    cargarEncuestas();
}
