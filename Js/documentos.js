async function cargarInicio() {
    const d = await pedir("../../Api/documentos.php?tipo=contadores");

    document.getElementById("totalPacientes").textContent = d.pacientes;
    document.getElementById("totalDocumentos").textContent = d.documentos;
    document.getElementById("totalEncuestas").textContent = d.encuestas;
}

if (document.getElementById("totalPacientes")) { cargarInicio(); }
