// Si la contraseña todavía es la que le puso el superadmin (bandera en 0),
// le mostramos el aviso para que elija una suya.
// El menú se arma según quién entró, así el chofer no pierde sus botones.

async function prepararMiClave() {
    const datos = await pedir("../../Api/sesion.php?tipo=clave");

    if (!datos) {
        return;
    }

    if (datos.clavePropia == 0) {
        document.getElementById("avisoCambiar").hidden = false;
    }

    if (datos.rol == "chofer") {
        document.getElementById("misTraslados").hidden = false;
        document.getElementById("volver").hidden = true;
        document.getElementById("rayaMenu").hidden = true;
    }

    // El superadmin no tiene modulos: lo mandamos de vuelta a su panel.
    if (datos.rol == "superadmin") {
        const volver = document.getElementById("volver");
        volver.href = "superadmin.html";
        volver.textContent = "← Volver al panel";
    }
}

if (document.getElementById("avisoCambiar")) {
    prepararMiClave();
}
