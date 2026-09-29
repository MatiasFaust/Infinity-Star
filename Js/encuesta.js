async function cargarEncuesta() {
    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
        document.getElementById("formulario").hidden = true;
        return;
    }

    const e = await pedir("Api/documentos.php?tipo=encuesta&id=" + id);

    if (!e.idEncuesta) {
        document.getElementById("formulario").hidden = true;
        document.getElementById("titulo").textContent = enIdioma("Esa encuesta no existe.");
        return;
    }

    document.getElementById("titulo").textContent = e.titulo;
    document.getElementById("encuesta").value = e.idEncuesta;

    const donde = document.getElementById("preguntas");

    for (let i = 0; i < e.preguntas.length; i++) {
        const p = e.preguntas[i];

        const etiqueta = document.createElement("label");
        etiqueta.textContent = p.texto;
        donde.appendChild(etiqueta);

        const select = document.createElement("select");
        select.name = "respuesta" + p.idPregunta;
        select.required = true;

        const notas = ["", "1", "2", "3", "4", "5"];
        const textos = [enIdioma("Elegir..."), "1 - " + enIdioma("Muy malo"), "2 - " + enIdioma("Malo"),
                        "3 - " + enIdioma("Regular"), "4 - " + enIdioma("Bueno"), "5 - " + enIdioma("Muy bueno")];

        for (let j = 0; j < notas.length; j++) {
            const opcion = document.createElement("option");
            opcion.value = notas[j];
            opcion.textContent = textos[j];
            select.appendChild(opcion);
        }

        donde.appendChild(select);
    }

    const direccion = new URLSearchParams(location.search);

    if (direccion.has("gracias")) {
        document.getElementById("formulario").hidden = true;
        document.getElementById("gracias").hidden = false;
    }
}

if (document.getElementById("preguntas")) {
    cargarEncuesta();
}
