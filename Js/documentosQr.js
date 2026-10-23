function dibujarQr(donde, texto) {
    new QRCode(donde, {
        text: texto,
        width: 90,
        height: 90,
        correctLevel: QRCode.CorrectLevel.M
    });
}

// El QR de la encuesta: el paciente lo escanea y contesta el formulario.
async function cargarEncuesta() {
    const datos = await pedir("../../Api/documentos.php?tipo=encuesta");
    const enlace = datos.enlace;

    document.getElementById("enlaceEncuesta").value = enlace;

    const caja = document.getElementById("qrEncuesta");
    caja.innerHTML = "";

    if (enlace == "") {
        document.getElementById("sinEncuesta").hidden = false;
        return;
    }

    document.getElementById("sinEncuesta").hidden = true;
    document.getElementById("botonesEncuesta").hidden = false;
    document.getElementById("verEncuesta").href = enlace;

    new QRCode(caja, {
        text: enlace,
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.M
    });
}

if (document.getElementById("qrEncuesta")) {
    cargarEncuesta();

    document.getElementById("quitarEncuesta").addEventListener("submit", function (evento) {
        if (!confirm(enIdioma("¿Seguro que querés sacar el QR de la encuesta?"))) {
            evento.preventDefault();
        }
    });
}

// Cambia el PDF pero deja el mismo documento, asi el QR que ya se imprimio
// sigue sirviendo y apunta al archivo nuevo.
function botonSustituir(id) {
    return "<form class='enLinea' action='../../subir.php?que=sustituir' method='POST' enctype='multipart/form-data'>" +
           "<input type='hidden' name='id' value='" + id + "'>" +
           "<input type='file' name='archivo' accept='.pdf,application/pdf' hidden id='archivo" + id + "'>" +
           "<button type='button' class='editar' onclick=\"document.getElementById('archivo" + id + "').click()\">" +
           enIdioma("Sustituir") + "</button>" +
           "</form>";
}

// Apenas eligen el archivo, se manda solo.
document.addEventListener("change", function (evento) {
    if (evento.target.type == "file" && evento.target.id.indexOf("archivo") == 0) {
        evento.target.form.submit();
    }
});

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
            botonSustituir(d.idDocumento) +
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
