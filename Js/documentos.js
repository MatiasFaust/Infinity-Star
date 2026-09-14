async function cargarInicio() {
    const d = await pedir("../../Api/documentos.php?tipo=contadores");

    document.getElementById("totalPacientes").textContent = d.pacientes;
    document.getElementById("totalDocumentos").textContent = d.documentos;
}

if (document.getElementById("totalPacientes")) { cargarInicio(); }
