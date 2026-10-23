function dibujarQr(donde, texto) {
    new QRCode(donde, {
        text: texto,
        width: 90,
        height: 90,
        correctLevel: QRCode.CorrectLevel.M
    });
}

// Los QR con enlaces: cada uno va en su propia tarjeta, una al lado de la
// otra, así nunca quedan encimados por más que haya muchos.

// Al tocar "Cambiar" en una tarjeta, el formulario de arriba se llena con
// sus datos y al guardar se cambia ese QR en vez de agregar uno nuevo.
function editarEnlace(e) {
    document.getElementById("idEnlace").value = e.idEnlace;
    document.getElementById("nombreEnlace").value = e.nombre;
    document.getElementById("enlaceQr").value = e.enlace;
    document.getElementById("guardarQr").textContent = enIdioma("Guardar cambios");
    document.getElementById("cancelarQr").hidden = false;

    document.getElementById("formularioQr").scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("nombreEnlace").focus();
}

function dejarDeEditar() {
    document.getElementById("formularioQr").reset();
    document.getElementById("idEnlace").value = "0";
    document.getElementById("guardarQr").textContent = enIdioma("Agregar QR");
    document.getElementById("cancelarQr").hidden = true;
}

function tarjetaDelEnlace(e) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjetaQr";

    const titulo = document.createElement("h3");
    titulo.textContent = e.nombre;

    const caja = document.createElement("div");
    caja.className = "cajaQr";

    new QRCode(caja, {
        text: e.enlace,
        width: 170,
        height: 170,
        correctLevel: QRCode.CorrectLevel.M
    });

    const direccion = document.createElement("p");
    direccion.className = "ayuda direccionQr";
    direccion.textContent = e.enlace;

    const botones = document.createElement("div");
    botones.className = "botonesQr";

    const abrir = document.createElement("a");
    abrir.className = "editar";
    abrir.href = e.enlace;
    abrir.target = "_blank";
    abrir.textContent = enIdioma("Abrir");

    const imprimir = document.createElement("a");
    imprimir.className = "editar";
    imprimir.href = "../../imprimirQr.html?enlace=" + e.idEnlace;
    imprimir.target = "_blank";
    imprimir.textContent = enIdioma("Imprimir");

    const cambiar = document.createElement("button");
    cambiar.type = "button";
    cambiar.className = "editar";
    cambiar.textContent = enIdioma("Cambiar");
    cambiar.addEventListener("click", function () {
        editarEnlace(e);
    });

    botones.append(abrir, imprimir, cambiar);
    botones.insertAdjacentHTML("beforeend", botonAccion("borrar.php?que=enlaceQr", e.idEnlace, "Quitar", "eliminar"));

    tarjeta.append(titulo, caja, direccion, botones);

    return tarjeta;
}

async function cargarEnlaces() {
    const lista = await pedir("../../Api/documentos.php?tipo=enlaces");
    const grilla = document.getElementById("grillaQr");

    grilla.innerHTML = "";

    document.getElementById("sinEnlaces").hidden = lista.length > 0;
    document.getElementById("botonesTodos").hidden = lista.length < 2;

    for (let i = 0; i < lista.length; i++) {
        grilla.appendChild(tarjetaDelEnlace(lista[i]));
    }
}

if (document.getElementById("grillaQr")) {
    document.getElementById("cancelarQr").addEventListener("click", dejarDeEditar);

    cargarEnlaces();
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
