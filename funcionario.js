const MOVILES = [
  { nombre: "Ambulancia 01", patente: "SAA 1234", padron: "456789" },
  { nombre: "Ambulancia 02", patente: "SBA 5678", padron: "987654" },
  { nombre: "Ambulancia 03", patente: "SCC 9012", padron: "321654" }
];

const CHOFERES = [
  { nombre: "Pedro Martínez", ci: "4.123.456-7", licencia: "A123456" },
  { nombre: "Juan Rodríguez", ci: "3.987.654-1", licencia: "B987654" },
  { nombre: "Carlos Gómez", ci: "4.567.890-2", licencia: "C987654" }
];

function obtenerTraslados() {
  return JSON.parse(localStorage.getItem("traslados")) || [];
}

function guardarTraslados(lista) {
  localStorage.setItem("traslados", JSON.stringify(lista));
}

function claseEstado(estado) {
  if (estado === "En curso") return "estado-en-curso";
  if (estado === "Completado") return "estado-completado";
  if (estado === "Cancelado") return "estado-cancelado";
  return "estado-pendiente";
}

function cambiarPantalla(nombre) {
  const modulo = document.getElementById("modulo-tras");

  modulo.querySelectorAll(".vista-func").forEach(function (vista) {
    vista.classList.toggle("activa", vista.id === "vista-tras-" + nombre);
  });

  modulo.querySelectorAll(".nav-func button").forEach(function (boton) {
    boton.classList.toggle("activo", boton.dataset.vista === nombre);
  });

  if (nombre === "inicio") actualizarStats();
  if (nombre === "ver") pintarListaTraslados();
}

function actualizarStats() {
  const lista = obtenerTraslados();
  document.getElementById("statTotal").textContent = lista.length;
  document.getElementById("statEnCurso").textContent = lista.filter(t => t.estado === "En curso").length;
  document.getElementById("statCompletados").textContent = lista.filter(t => t.estado === "Completado").length;
}

// modales para elegir móvil y chofer

function abrirModal(id) {
  pintarModalMovil();
  pintarModalChofer();
  document.getElementById(id).classList.remove("oculto");
}

function cerrarModal(id) {
  document.getElementById(id).classList.add("oculto");
}

function pintarModalMovil() {
  const cont = document.getElementById("listaModalMovil");
  cont.innerHTML = "";

  for (let i = 0; i < MOVILES.length; i++) {
    const m = MOVILES[i];
    const item = document.createElement("div");
    item.className = "item-modal";
    item.innerHTML = `
      <div class="item-modal-texto">
        <strong>${m.nombre}</strong>
        <span>Patente: ${m.patente} &nbsp; Padrón: ${m.padron}</span>
      </div>
      <button type="button" class="btn-primario" onclick="seleccionarMovil(${i})">Seleccionar</button>
    `;
    cont.appendChild(item);
  }
}

function pintarModalChofer() {
  const cont = document.getElementById("listaModalChofer");
  cont.innerHTML = "";

  for (let i = 0; i < CHOFERES.length; i++) {
    const c = CHOFERES[i];
    const item = document.createElement("div");
    item.className = "item-modal";
    item.innerHTML = `
      <div class="item-modal-texto">
        <strong>${c.nombre}</strong>
        <span>CI: ${c.ci} &nbsp; Licencia: ${c.licencia}</span>
      </div>
      <button type="button" class="btn-primario" onclick="seleccionarChofer(${i})">Seleccionar</button>
    `;
    cont.appendChild(item);
  }
}

function seleccionarMovil(i) {
  document.getElementById("movilSeleccionado").value = MOVILES[i].nombre;
  cerrarModal("modalMovil");
}

function seleccionarChofer(i) {
  document.getElementById("choferSeleccionado").value = CHOFERES[i].nombre;
  cerrarModal("modalChofer");
}

// busca un paciente ya cargado en Documentos por su CI

function buscarPacientePorCi(tipo) {
  const ci = document.getElementById(tipo + "Ci").value.trim();
  const inputNombre = document.getElementById(tipo + "Nombre");

  if (!ci) return;

  const pacientes = obtenerPacientes();
  const pac = pacientes.find(p => p.ci.toLowerCase() === ci.toLowerCase());

  if (pac) {
    inputNombre.value = `${pac.nombre} ${pac.apellido}`;
  } else {
    inputNombre.value = "";
    alert("No se encontró ningún paciente con esa CI. Cargalo primero en el módulo Documentos, o escribí el nombre manualmente.");
  }
}

// registrar / editar traslado

function limpiarFormularioTraslado() {
  document.getElementById("formTraslado").reset();
  document.getElementById("editando").value = "";
  document.getElementById("movilSeleccionado").value = "";
  document.getElementById("choferSeleccionado").value = "";
  document.getElementById("tituloFormulario").textContent = "Registrar traslado";
}

function editarTraslado(i) {
  const lista = obtenerTraslados();
  const t = lista[i];

  document.getElementById("editando").value = i;
  document.getElementById("fechaSalida").value = t.fechaSalida || "";
  document.getElementById("fechaLlegada").value = t.fechaLlegada || "";
  document.getElementById("origen").value = t.origen || "";
  document.getElementById("destino").value = t.destino || "";
  document.getElementById("ruta").value = t.ruta || "";
  document.getElementById("pacienteCi").value = t.pacienteCi || "";
  document.getElementById("pacienteNombre").value = t.pacienteNombre || "";
  document.getElementById("acompananteCi").value = t.acompananteCi || "";
  document.getElementById("acompananteNombre").value = t.acompananteNombre || "";
  document.getElementById("movilSeleccionado").value = t.movil || "";
  document.getElementById("choferSeleccionado").value = t.chofer || "";
  document.getElementById("elemento").value = t.elemento || "";
  document.getElementById("medico").value = t.medico || "";
  document.getElementById("observaciones").value = t.observaciones || "";
  document.getElementById("tituloFormulario").textContent = "Modificar traslado";

  cambiarPantalla("registrar");
}

function cancelarTraslado(i) {
  const lista = obtenerTraslados();
  lista[i].estado = "Cancelado";
  guardarTraslados(lista);
  document.getElementById("detalleTraslado").classList.add("oculto");
  pintarListaTraslados();
}

document.getElementById("formTraslado").addEventListener("submit", function (event) {
  event.preventDefault();

  const lista = obtenerTraslados();
  const editIndex = document.getElementById("editando").value;

  const datos = {
    fechaSalida: document.getElementById("fechaSalida").value,
    fechaLlegada: document.getElementById("fechaLlegada").value,
    origen: document.getElementById("origen").value,
    destino: document.getElementById("destino").value,
    ruta: document.getElementById("ruta").value,
    pacienteCi: document.getElementById("pacienteCi").value,
    pacienteNombre: document.getElementById("pacienteNombre").value,
    acompananteCi: document.getElementById("acompananteCi").value,
    acompananteNombre: document.getElementById("acompananteNombre").value.trim() || "No aplica",
    movil: document.getElementById("movilSeleccionado").value,
    chofer: document.getElementById("choferSeleccionado").value,
    elemento: document.getElementById("elemento").value,
    medico: document.getElementById("medico").value,
    observaciones: document.getElementById("observaciones").value,
    estado: editIndex !== "" ? lista[editIndex].estado : "Pendiente"
  };

  if (editIndex !== "") {
    lista[editIndex] = datos;
  } else {
    lista.push(datos);
  }

  guardarTraslados(lista);
  limpiarFormularioTraslado();

  const aviso = document.getElementById("mensajeExitoTraslado");
  aviso.classList.remove("oculto");
  setTimeout(() => aviso.classList.add("oculto"), 3000);
});

// ver traslados, lista con menu de los 3 puntitos

function pintarListaTraslados() {
  const lista = obtenerTraslados();
  const texto = document.getElementById("buscar").value.toLowerCase();
  const filtroEstado = document.getElementById("filtroEstado").value;

  const filtrados = lista
    .map((t, i) => ({ ...t, i }))
    .filter(t => {
      const coincideTexto = !texto ||
        (t.pacienteNombre || "").toLowerCase().includes(texto) ||
        (t.destino || "").toLowerCase().includes(texto);
      const coincideEstado = !filtroEstado || t.estado === filtroEstado;
      return coincideTexto && coincideEstado;
    });

  const cont = document.getElementById("listaTraslados");
  cont.innerHTML = "";

  if (filtrados.length === 0) {
    cont.innerHTML = '<p class="sin-datos">No hay traslados que coincidan.</p>';
    return;
  }

  filtrados.forEach(t => {
    const item = document.createElement("div");
    item.className = "item-documento";
    item.innerHTML = `
      <i class="ti ti-ambulance"></i>
      <div class="item-documento-texto">
        <strong>${t.pacienteNombre || "Sin paciente"} — ${t.fechaSalida || ""}</strong>
        <span>${t.origen || "-"} → ${t.destino || "-"} <span class="estado-badge ${claseEstado(t.estado)}">${t.estado}</span></span>
      </div>
      <div class="kebab">
        <button type="button" class="kebab-btn" onclick="toggleKebabTraslado(event, ${t.i})"><i class="ti ti-dots-vertical"></i></button>
        <div class="kebab-menu" id="kebabTras-${t.i}">
          <button type="button" onclick="verDetalleTraslado(${t.i})"><i class="ti ti-eye"></i> Ver detalle</button>
          <button type="button" onclick="editarTraslado(${t.i})"><i class="ti ti-pencil"></i> Editar</button>
          <button type="button" onclick="cancelarTraslado(${t.i})"><i class="ti ti-x"></i> Cancelar</button>
        </div>
      </div>
    `;
    cont.appendChild(item);
  });
}

function toggleKebabTraslado(event, i) {
  event.stopPropagation();
  const menu = document.getElementById("kebabTras-" + i);
  const yaAbierto = menu.classList.contains("abierto");

  document.querySelectorAll(".kebab-menu.abierto").forEach(m => m.classList.remove("abierto"));

  if (!yaAbierto) {
    menu.classList.add("abierto");
  }
}

document.addEventListener("click", function () {
  document.querySelectorAll(".kebab-menu.abierto").forEach(m => m.classList.remove("abierto"));
});

function verDetalleTraslado(i) {
  const lista = obtenerTraslados();
  const t = lista[i];
  const detalle = document.getElementById("detalleTraslado");

  detalle.innerHTML = `
    <button type="button" class="btn-secundario" onclick="document.getElementById('detalleTraslado').classList.add('oculto')">
      <i class="ti ti-x"></i> Cerrar
    </button>
    <h3>${t.pacienteNombre || "Sin paciente"}</h3>
    <p><strong>CI paciente:</strong> ${t.pacienteCi || "-"}</p>
    <p><strong>Acompañante:</strong> ${t.acompananteNombre || "No aplica"} ${t.acompananteCi ? "(CI " + t.acompananteCi + ")" : ""}</p>
    <p><strong>Fecha de salida:</strong> ${t.fechaSalida || "-"}</p>
    <p><strong>Fecha de llegada:</strong> ${t.fechaLlegada || "-"}</p>
    <p><strong>Origen:</strong> ${t.origen || "-"}</p>
    <p><strong>Destino:</strong> ${t.destino || "-"}</p>
    <p><strong>Ruta:</strong> ${t.ruta || "-"}</p>
    <p><strong>Móvil:</strong> ${t.movil || "-"}</p>
    <p><strong>Chofer:</strong> ${t.chofer || "-"}</p>
    <p><strong>Elemento a trasladar:</strong> ${t.elemento || "-"}</p>
    <p><strong>Médico solicitante:</strong> ${t.medico || "-"}</p>
    <p><strong>Observaciones:</strong> ${t.observaciones || "-"}</p>
    <p><strong>Estado:</strong> <span class="estado-badge ${claseEstado(t.estado)}">${t.estado}</span></p>
  `;
  detalle.classList.remove("oculto");
}

document.querySelectorAll("#modulo-tras [data-vista]").forEach(function (elemento) {
  elemento.addEventListener("click", function () {
    cambiarPantalla(this.dataset.vista);
  });
});

document.getElementById("buscar").addEventListener("input", pintarListaTraslados);
document.getElementById("filtroEstado").addEventListener("change", pintarListaTraslados);

actualizarStats();
