async function cargarQr() {
    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
        return;
    }

    const d = await pedir("Api/documentos.php?tipo=documento&id=" + id);

    if (!d.idDocumento) {
        document.getElementById("titulo").textContent = enIdioma("Ese documento no está disponible.");
        return;
    }

    document.getElementById("titulo").textContent = d.titulo;

    const enlace = location.origin + location.pathname.replace("imprimirQr.html", "") + "documento.php?id=" + d.idDocumento;

    new QRCode(document.getElementById("qr"), {
        text: enlace,
        width: 260,
        height: 260,
        correctLevel: QRCode.CorrectLevel.M
    });

    document.getElementById("imprimir").addEventListener("click", function () {
        window.print();
    });
}

if (document.getElementById("qr")) {
    cargarQr();
}
