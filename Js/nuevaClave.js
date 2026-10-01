const codigoDelEnlace = new URLSearchParams(location.search).get("codigo");

if (document.getElementById("codigo")) {
    if (!codigoDelEnlace) {
        document.getElementById("formulario").hidden = true;
    } else {
        document.getElementById("codigo").value = codigoDelEnlace;
    }
}
