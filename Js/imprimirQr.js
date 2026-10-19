async function cargarQr() {
    const direccion = new URLSearchParams(location.search);

    // El QR de la encuesta de satisfacción, para pegar en la sala de espera.
    if (direccion.get("encuesta")) {
        const datos = await pedir("Api/documentos.php?tipo=encuesta");

        if (!datos.enlace) {
            document.getElementById("titulo").textContent = enIdioma("Todavía no cargaste el enlace del formulario.");
            return;
        }

        document.getElementById("titulo").textContent = enIdioma("Encuesta de satisfacción");

        new QRCode(document.getElementById("qr"), {
            text: datos.enlace,
            width: 260,
            height: 260,
            correctLevel: QRCode.CorrectLevel.M
        });

        document.getElementById("enlace").textContent = datos.enlace;

        document.getElementById("imprimir").addEventListener("click", function () {
            window.print();
        });

        return;
    }

    const id = direccion.get("id");

    if (!id) {
        return;
    }

    const d = await pedir("Api/documentos.php?tipo=documento&id=" + id);

    if (!d.idDocumento) {
        document.getElementById("titulo").textContent = enIdioma("Ese documento no está disponible.");
        return;
    }

    document.getElementById("titulo").textContent = d.titulo;

    const enlace = d.enlace;

    new QRCode(document.getElementById("qr"), {
        text: enlace,
        width: 260,
        height: 260,
        correctLevel: QRCode.CorrectLevel.M
    });

    document.getElementById("enlace").textContent = enlace;

    document.getElementById("imprimir").addEventListener("click", function () {
        window.print();
    });
}

if (document.getElementById("qr")) {
    cargarQr();
}
