// Si la contraseña todavía es la que le puso el superadmin (bandera en 0),
// le mostramos el aviso para que elija una suya.
// También dejamos el "volver" apuntando al panel que le corresponde.

async function prepararMiClave() {
    const datos = await pedir("../../Api/sesion.php?tipo=clave");

    if (!datos) {
        return;
    }

    if (datos.clavePropia == 0) {
        document.getElementById("avisoCambiar").hidden = false;
    }

    const volver = document.getElementById("volver");

    if (datos.rol == "chofer") {
        volver.setAttribute("href", "Chofer.html");
        volver.textContent = enIdioma("← Volver a mis traslados");
    }
}

if (document.getElementById("avisoCambiar")) {
    prepararMiClave();
}
