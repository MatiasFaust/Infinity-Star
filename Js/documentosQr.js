function dibujarQr(donde, texto) {
    new QRCode(donde, {
        text: texto,
        width: 90,
        height: 90,
        correctLevel: QRCode.CorrectLevel.M
    });
}

async function cargarDocumentos() {
    const datos = await pedir("../../Api/documentos.php?tipo=documentos");
    const lista = datos.lista;
    const cuerpo = document.getElementById("cuerpoDocumentos");

    cuerpo.innerHTML = "";

    document.getElementById("direccion").textContent = datos.base;

    if (lista.length == 0) {
        document.getElementById("vacio").hidden = false;
        return;
    }

    document.getElementById("vacio").hidden = true;

    for (let i = 0; i < lista.length; i++) {
        const d = lista[i];
        const enlace = d.enlace;

        const fila = document.createElement("tr");

        const celdaTitulo = document.createElement("td");
        celdaTitulo.textContent = d.titulo;

        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = fechaCorta(d.fecha);

        const celdaQr = document.createElement("td");
        dibujarQr(celdaQr, enlace);

        const celdaBotones = document.createElement("td");
        celdaBotones.innerHTML =
            "<a class='editar' href='../../documento.php?id=" + d.idDocumento + "' target='_blank'>" + enIdioma("Ver PDF") + "</a>" +
            "<a class='editar' href='../../imprimirQr.html?id=" + d.idDocumento + "' target='_blank'>" + enIdioma("Imprimir QR") + "</a>" +
            botonAccion("borrar.php?que=documento", d.idDocumento, "Eliminar", "eliminar");

        fila.appendChild(celdaTitulo);
        fila.appendChild(celdaFecha);
        fila.appendChild(celdaQr);
        fila.appendChild(celdaBotones);

        cuerpo.appendChild(fila);
    }
}

if (document.getElementById("cuerpoDocumentos")) {
    const select = document.getElementById("tituloDocumento");

    select.addEventListener("change", function () {
        const esOtro = select.value == "otro";

        document.getElementById("parteOtro").hidden = !esOtro;
        document.getElementById("otroTitulo").required = esOtro;
    });

    cargarDocumentos();
}
