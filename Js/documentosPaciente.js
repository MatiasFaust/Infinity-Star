function dibujarDocPaciente(lista, texto) {
    const cuerpo = document.getElementById("cuerpoDocPaciente");
    cuerpo.innerHTML = "";

    const encontrados = filtrar(lista, texto, ["nombre", "apellido", "cedula", "titulo"]);

    document.getElementById("vacio").hidden = encontrados.length > 0;

    for (let i = 0; i < encontrados.length; i++) {
        const d = encontrados[i];
        const fila = document.createElement("tr");

        fila.innerHTML =
            "<td>" + d.nombre + " " + d.apellido + "</td>" +
            "<td>" + d.cedula + "</td>" +
            "<td>" + d.titulo + "</td>" +
            "<td>" + fechaCorta(d.fecha) + "</td>" +
            "<td>" +
            "<a class='editar' target='_blank' href='" + d.enlace + "'>" + enIdioma("Ver PDF") + "</a>" +
            botonAccion("borrar.php?que=docPaciente", d.idDocumento, "Eliminar", "eliminar") +
            "</td>";

        cuerpo.appendChild(fila);
    }
}


async function cargarDocPaciente() {
    const datos = await pedir("../../Api/documentos.php?tipo=documentosPaciente");

    dibujarDocPaciente(datos.lista, "");

    const buscador = document.getElementById("buscarDocPaciente");

    buscador.addEventListener("input", function () {
        dibujarDocPaciente(datos.lista, buscador.value);
    });
}

if (document.getElementById("cuerpoDocPaciente")) {
    const tipo = document.getElementById("tituloPaciente");

    tipo.addEventListener("change", function () {
        const esOtro = tipo.value == "otro";

        document.getElementById("parteOtro").hidden = !esOtro;
        document.getElementById("otroTitulo").required = esOtro;
    });

    cargarDocPaciente();
}
