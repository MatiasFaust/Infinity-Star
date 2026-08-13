function obtenerDocumentos() {
  return JSON.parse(localStorage.getItem("documentos")) || [];
}

function guardarDocumentos(lista) {
  localStorage.setItem("documentos", JSON.stringify(lista));
}

function obtenerPacientes() {
  return JSON.parse(localStorage.getItem("pacientes")) || [];
}

function guardarPacientes(lista) {
  localStorage.setItem("pacientes", JSON.stringify(lista));
}

function obtenerEncuestas() {
  return JSON.parse(localStorage.getItem("encuestas")) || [];
}

function guardarEncuestas(lista) {
  localStorage.setItem("encuestas", JSON.stringify(lista));
}

let docSeleccionado = null;

function verSeccionDoc(nombre) {
  const modulo = document.getElementById("modulo-doc");

  modulo.querySelectorAll(".vista-func").forEach(function (vista) {
    vista.classList.toggle("activa", vista.id === "vista-doc-" + nombre);
  });

  modulo.querySelectorAll(".nav-func button").forEach(function (boton) {
    boton.classList.toggle("activo", boton.dataset.vista === nombre);
  });

  if (nombre === "inicio") actualizarStatsDoc();
  if (nombre === "ver") pintarListaDocumentos();
  if (nombre === "exportar") pintarTablaExportar();
  if (nombre === "buscar") pintarPacientes();
  if (nombre === "encuestas") pintarTablaEncuestas();
}

function buscarPacienteObjeto(ci) {
  return obtenerPacientes().find(p => p.ci === ci);
}

function actualizarStatsDoc() {
  const documentos = obtenerDocumentos();
  const pacientes = obtenerPacientes();
  const hoy = new Date().toISOString().slice(0, 10);

  document.getElementById("statDocs").textContent = documentos.length;
  document.getElementById("statPacientes").textContent = pacientes.length;
  document.getElementById("statCargasHoy").textContent = documentos.filter(d => d.fecha === hoy).length;
}

// registrar / editar paciente

function limpiarFormularioPaciente() {
  document.getElementById("formPaciente").reset();
  document.getElementById("pacEditando").value = "";
  document.getElementById("tituloFormularioPaciente").textContent = "Registrar paciente";
}

function editarPaciente(ci) {
  const p = buscarPacienteObjeto(ci);
  if (!p) return;

  document.getElementById("pacEditando").value = p.ci;
  document.getElementById("pacNombre").value = p.nombre;
  document.getElementById("pacApellido").value = p.apellido;
  document.getElementById("pacCi").value = p.ci;
  document.getElementById("pacFechaNacimiento").value = p.fechaNacimiento || "";
  document.getElementById("pacTelefono").value = p.telefono || "";
  document.getElementById("tituloFormularioPaciente").textContent = "Editar paciente";

  verSeccionDoc("paciente");
}

document.getElementById("formPaciente").addEventListener("submit", function (event) {
  event.preventDefault();

  const ci = document.getElementById("pacCi").value.trim();
  const ciOriginal = document.getElementById("pacEditando").value;
  const pacientes = obtenerPacientes();

  const chocaConOtro = pacientes.some(p => p.ci.toLowerCase() === ci.toLowerCase() && p.ci !== ciOriginal);
  if (chocaConOtro) {
    alert("Ya hay un paciente registrado con esa CI.");
    return;
  }

  const datos = {
    ci: ci,
    nombre: document.getElementById("pacNombre").value,
    apellido: document.getElementById("pacApellido").value,
    fechaNacimiento: document.getElementById("pacFechaNacimiento").value,
    telefono: document.getElementById("pacTelefono").value
  };

  if (ciOriginal !== "") {
    const idx = pacientes.findIndex(p => p.ci === ciOriginal);
    if (idx !== -1) pacientes[idx] = datos;
  } else {
    pacientes.push(datos);
  }

  guardarPacientes(pacientes);
  limpiarFormularioPaciente();

  const aviso = document.getElementById("mensajeExitoPaciente");
  aviso.classList.remove("oculto");
  setTimeout(() => aviso.classList.add("oculto"), 3000);
});

// importar / editar documento

function limpiarFormularioDocumento() {
  document.getElementById("formDocumento").reset();
  document.getElementById("docEditando").value = "";
  document.getElementById("tituloFormularioDoc").textContent = "Importar documento";
}

document.getElementById("formDocumento").addEventListener("submit", function (event) {
  event.preventDefault();

  const ci = document.getElementById("docPacienteCi").value.trim();
  const nombrePaciente = document.getElementById("docPacienteNombre").value.trim();

  if (!ci || !nombrePaciente || !buscarPacienteObjeto(ci)) {
    alert("Buscá un paciente ya registrado por su CI antes de guardar el documento. Si todavía no existe, registralo primero.");
    return;
  }

  const documentos = obtenerDocumentos();
  const editIndex = document.getElementById("docEditando").value;

  const datos = {
    fecha: editIndex !== "" ? documentos[editIndex].fecha : new Date().toISOString().slice(0, 10),
    pacienteCi: ci,
    pacienteNombre: nombrePaciente,
    diagnostico: document.getElementById("docDiagnostico").value,
    observaciones: document.getElementById("docObservaciones").value,
    tipo: "Formulario"
  };

  if (editIndex !== "") {
    documentos[editIndex] = datos;
  } else {
    documentos.push(datos);
  }

  guardarDocumentos(documentos);
  limpiarFormularioDocumento();

  const aviso = document.getElementById("mensajeExitoImportar");
  aviso.classList.remove("oculto");
  setTimeout(() => aviso.classList.add("oculto"), 3000);
});

function editarDocumento(i) {
  const documentos = obtenerDocumentos();
  const d = documentos[i];

  document.getElementById("docEditando").value = i;
  document.getElementById("docPacienteCi").value = d.pacienteCi || "";
  document.getElementById("docPacienteNombre").value = d.pacienteNombre || "";
  document.getElementById("docDiagnostico").value = d.diagnostico || "";
  document.getElementById("docObservaciones").value = d.observaciones || "";
  document.getElementById("tituloFormularioDoc").textContent = "Editar documento";

  verSeccionDoc("importar");
}

function eliminarDocumento(i) {
  const documentos = obtenerDocumentos();
  documentos.splice(i, 1);
  guardarDocumentos(documentos);
  document.getElementById("detalleDocumento").classList.add("oculto");
  pintarListaDocumentos();
}

// ver documentos, lista con menu de los 3 puntitos

function pintarListaDocumentos() {
  const documentos = obtenerDocumentos();
  const texto = document.getElementById("buscarDoc").value.toLowerCase();

  const filtrados = documentos
    .map((d, i) => ({ ...d, i }))
    .filter(d => !texto || `${d.pacienteNombre} ${d.pacienteCi}`.toLowerCase().includes(texto));

  const cont = document.getElementById("listaDocumentos");
  cont.innerHTML = "";

  if (filtrados.length === 0) {
    cont.innerHTML = '<p class="sin-datos">No hay documentos que coincidan.</p>';
    return;
  }

  filtrados.forEach(d => {
    const item = document.createElement("div");
    item.className = "item-documento";
    item.innerHTML = `
      <i class="ti ti-file-text"></i>
      <div class="item-documento-texto">
        <strong>${d.pacienteNombre}</strong>
        <span>${d.fecha}</span>
      </div>
      <div class="kebab">
        <button type="button" class="kebab-btn" onclick="toggleKebab(event, ${d.i})"><i class="ti ti-dots-vertical"></i></button>
        <div class="kebab-menu" id="kebab-${d.i}">
          <button type="button" onclick="verDocumento(${d.i})"><i class="ti ti-eye"></i> Ver documento</button>
          <button type="button" onclick="descargarPDF(${d.i})"><i class="ti ti-file-type-pdf"></i> Descargar PDF</button>
          <button type="button" onclick="editarDocumento(${d.i})"><i class="ti ti-pencil"></i> Editar</button>
          <button type="button" onclick="eliminarDocumento(${d.i})"><i class="ti ti-trash"></i> Eliminar</button>
        </div>
      </div>
    `;
    cont.appendChild(item);
  });
}

function toggleKebab(event, i) {
  event.stopPropagation();
  const menu = document.getElementById("kebab-" + i);
  const yaAbierto = menu.classList.contains("abierto");

  document.querySelectorAll(".kebab-menu.abierto").forEach(m => m.classList.remove("abierto"));

  if (!yaAbierto) {
    menu.classList.add("abierto");
  }
}

document.addEventListener("click", function () {
  document.querySelectorAll(".kebab-menu.abierto").forEach(m => m.classList.remove("abierto"));
});

function verDocumento(i) {
  const documentos = obtenerDocumentos();
  const d = documentos[i];
  const pac = buscarPacienteObjeto(d.pacienteCi);
  const detalle = document.getElementById("detalleDocumento");

  detalle.innerHTML = `
    <button type="button" class="btn-secundario" onclick="document.getElementById('detalleDocumento').classList.add('oculto')">
      <i class="ti ti-x"></i> Cerrar
    </button>
    <h3>${d.pacienteNombre}</h3>
    <p><strong>CI:</strong> ${d.pacienteCi}</p>
    <p><strong>Fecha de nacimiento:</strong> ${pac ? (pac.fechaNacimiento || "-") : "-"}</p>
    <p><strong>Tipo de documento:</strong> ${d.tipo}</p>
    <p><strong>Fecha de carga:</strong> ${d.fecha}</p>
    <p><strong>Diagnóstico:</strong> ${d.diagnostico || "-"}</p>
    <p><strong>Observaciones:</strong> ${d.observaciones || "-"}</p>
  `;
  detalle.classList.remove("oculto");
}

// exportar documento (PDF / QR)

function pintarTablaExportar() {
  const documentos = obtenerDocumentos();
  const texto = document.getElementById("buscarExportar").value.toLowerCase();

  const filtrados = documentos
    .map((d, i) => ({ ...d, i }))
    .filter(d => !texto || `${d.pacienteNombre} ${d.pacienteCi}`.toLowerCase().includes(texto));

  const cuerpo = document.getElementById("cuerpoExportar");
  cuerpo.innerHTML = "";
  docSeleccionado = null;
  document.getElementById("contenedorQR").classList.add("oculto");

  if (filtrados.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="3" class="sin-datos">No hay documentos que coincidan.</td></tr>';
    return;
  }

  filtrados.forEach(d => {
    const fila = document.createElement("tr");
    fila.className = "fila-seleccionable";
    fila.innerHTML = `
      <td>${d.fecha}</td>
      <td>${d.tipo}</td>
      <td>${d.pacienteNombre}</td>
    `;
    fila.addEventListener("click", function () {
      document.querySelectorAll("#cuerpoExportar tr").forEach(f => f.classList.remove("fila-seleccionada"));
      fila.classList.add("fila-seleccionada");
      docSeleccionado = d.i;
    });
    cuerpo.appendChild(fila);
  });
}

document.getElementById("buscarExportar").addEventListener("input", pintarTablaExportar);

function generarPDF(documento) {
  const pac = buscarPacienteObjeto(documento.pacienteCi);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(16);
  pdf.text("Clínica Infinity", 10, 15);
  pdf.setFontSize(11);
  pdf.text(`Tipo de documento: ${documento.tipo}`, 10, 28);
  pdf.text(`Nombre: ${documento.pacienteNombre}`, 10, 36);
  pdf.text(`CI: ${documento.pacienteCi}`, 10, 44);
  pdf.text(`Fecha de nacimiento: ${pac ? (pac.fechaNacimiento || "-") : "-"}`, 10, 52);
  pdf.text(`Fecha de carga: ${documento.fecha}`, 10, 60);

  pdf.text("Diagnóstico:", 10, 72);
  const lineasDiagnostico = pdf.splitTextToSize(documento.diagnostico || "-", 190);
  pdf.text(lineasDiagnostico, 10, 80);

  const yObs = 80 + lineasDiagnostico.length * 7 + 10;
  pdf.text("Observaciones:", 10, yObs);
  pdf.text(pdf.splitTextToSize(documento.observaciones || "-", 190), 10, yObs + 8);

  pdf.save(`${documento.pacienteNombre.replace(/\s+/g, "_")}.pdf`);
}

function descargarPDF(i) {
  const documentos = obtenerDocumentos();
  generarPDF(documentos[i]);
}

document.getElementById("btnGenerarPDF").addEventListener("click", function () {
  if (docSeleccionado === null) {
    alert("Elegí un documento de la lista primero.");
    return;
  }

  const documentos = obtenerDocumentos();
  generarPDF(documentos[docSeleccionado]);
  avisoExportado();
});

document.getElementById("btnGenerarQR").addEventListener("click", function () {
  if (docSeleccionado === null) {
    alert("Elegí un documento de la lista primero.");
    return;
  }

  const documentos = obtenerDocumentos();
  const d = documentos[docSeleccionado];

  const texto = `Paciente: ${d.pacienteNombre}\nCI: ${d.pacienteCi}\nTipo: ${d.tipo}\nFecha: ${d.fecha}`;
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(texto)}`;

  const cont = document.getElementById("contenedorQR");
  cont.innerHTML = `<img src="${url}" alt="QR del documento" width="200" height="200">`;
  cont.classList.remove("oculto");

  avisoExportado();
});

function avisoExportado() {
  const aviso = document.getElementById("mensajeExitoExportar");
  aviso.classList.remove("oculto");
  setTimeout(() => aviso.classList.add("oculto"), 3000);
}

// buscar paciente

function pintarPacientes() {
  const pacientes = obtenerPacientes();
  const documentos = obtenerDocumentos();
  const texto = document.getElementById("buscarPaciente").value.toLowerCase();

  const filtrados = pacientes.filter(p =>
    !texto || `${p.nombre} ${p.apellido} ${p.ci}`.toLowerCase().includes(texto)
  );

  const cuerpo = document.getElementById("cuerpoPacientes");
  cuerpo.innerHTML = "";

  if (filtrados.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="5" class="sin-datos">No hay pacientes que coincidan.</td></tr>';
    return;
  }

  filtrados.forEach(p => {
    const cantidad = documentos.filter(d => d.pacienteCi === p.ci).length;
    const ciEscapada = p.ci.replace(/'/g, "\\'");
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre} ${p.apellido}</td>
      <td>${p.ci}</td>
      <td>${p.fechaNacimiento || "-"}</td>
      <td>${cantidad}</td>
      <td class="acciones-tabla">
        <button type="button" onclick="verDocumentosDePaciente('${ciEscapada}')"><i class="ti ti-eye"></i> Documentos</button>
        <button type="button" onclick="editarPaciente('${ciEscapada}')"><i class="ti ti-pencil"></i> Editar</button>
      </td>
    `;
    cuerpo.appendChild(fila);
  });
}

function verDocumentosDePaciente(ci) {
  document.getElementById("buscarDoc").value = ci;
  verSeccionDoc("ver");
}

// encuestas

function pintarTablaEncuestas() {
  const encuestas = obtenerEncuestas();
  const cuerpo = document.getElementById("cuerpoEncuestas");
  cuerpo.innerHTML = "";

  if (encuestas.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="4" class="sin-datos">Todavía no hay encuestas cargadas.</td></tr>';
    return;
  }

  encuestas.forEach(e => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${e.fecha}</td>
      <td>${e.paciente}</td>
      <td class="calificacion-estrellas">${'<i class="ti ti-star-filled"></i>'.repeat(Number(e.calificacion))}</td>
      <td>${e.comentario || "-"}</td>
    `;
    cuerpo.appendChild(fila);
  });
}

document.querySelectorAll("#modulo-doc [data-vista]").forEach(function (elemento) {
  elemento.addEventListener("click", function () {
    verSeccionDoc(this.dataset.vista);
  });
});

document.getElementById("buscarDoc").addEventListener("input", pintarListaDocumentos);
document.getElementById("buscarPaciente").addEventListener("input", pintarPacientes);

document.getElementById("formEncuesta").addEventListener("submit", function (event) {
  event.preventDefault();

  const encuestas = obtenerEncuestas();
  encuestas.push({
    fecha: new Date().toISOString().slice(0, 10),
    paciente: document.getElementById("encuestaPaciente").value,
    calificacion: document.getElementById("encuestaCalificacion").value,
    comentario: document.getElementById("encuestaComentario").value
  });

  guardarEncuestas(encuestas);

  this.reset();
  verSeccionDoc("inicio");
});

actualizarStatsDoc();
