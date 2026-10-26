async function cargarQr() {
    const direccion = new URLSearchParams(location.search);

    document.getElementById("imprimir").addEventListener("click", function () {
        window.print();
    });

    // Todos los QR con enlace en una misma hoja, cada uno en su lugar.
    if (direccion.get("enlaces") == "todos") {
        const lista = await pedir("Api/documentos.php?tipo=enlaces");

        document.getElementById("titulo").hidden = true;
        document.getElementById("qr").hidden = true;
        document.getElementById("explicacion").textContent = enIdioma("Escaneá el código con la cámara del celular.");

        const grilla = document.getElementById("todos");

        for (let i = 0; i < lista.length; i++) {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjetaQr";

            const nombre = document.createElement("h3");
            nombre.textContent = lista[i].nombre;

            const caja = document.createElement("div");
            caja.className = "cajaQr";

            new QRCode(caja, {
                text: lista[i].enlace,
                width: 180,
                height: 180,
                correctLevel: QRCode.CorrectLevel.M
            });

            tarjeta.append(nombre, caja);
            grilla.appendChild(tarjeta);
        }

        return;
    }

    // Un QR con enlace, por ejemplo la encuesta, para pegar en la sala de espera.
    if (direccion.get("enlace")) {
        const e = await pedir("Api/documentos.php?tipo=enlace&id=" + encodeURIComponent(direccion.get("enlace")));

        if (!e.idEnlace) {
            document.getElementById("titulo").textContent = enIdioma("Ese QR ya no existe.");
            return;
        }

        document.getElementById("titulo").textContent = e.nombre;
        document.getElementById("explicacion").textContent = enIdioma("Escaneá el código con la cámara del celular.");

        new QRCode(document.getElementById("qr"), {
            text: e.enlace,
            width: 260,
            height: 260,
            correctLevel: QRCode.CorrectLevel.M
        });

        document.getElementById("enlace").textContent = e.enlace;

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
}

if (document.getElementById("qr")) {
    cargarQr();
}
