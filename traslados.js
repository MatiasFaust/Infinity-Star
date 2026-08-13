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

function pintarLista() {
  const lista = obtenerTraslados();
  const cuerpo = document.getElementById("cuerpoTrasladosChofer");
  cuerpo.innerHTML = "";

  if (lista.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="6" class="sin-datos">Todavía no hay traslados asignados.</td></tr>';
    return;
  }

  lista.forEach((t, i) => {
    const fila = document.createElement("tr");

    let botonEstado = "";
    if (t.estado === "Pendiente") {
      botonEstado = `<button type="button" onclick="cambiarEstado(${i}, 'En curso')"><i class="ti ti-player-play"></i> Iniciar viaje</button>`;
    } else if (t.estado === "En curso") {
      botonEstado = `<button type="button" onclick="cambiarEstado(${i}, 'Completado')"><i class="ti ti-circle-check"></i> Marcar completado</button>`;
    }

    fila.innerHTML = `
      <td>${t.fechaSalida || "-"}</td>
      <td>${t.pacienteNombre || "-"}</td>
      <td>${t.origen || "-"}</td>
      <td>${t.destino || "-"}</td>
      <td><span class="estado-badge ${claseEstado(t.estado)}">${t.estado}</span></td>
      <td class="acciones-tabla">
        ${botonEstado}
      </td>
    `;
    cuerpo.appendChild(fila);
  });
}

function cambiarEstado(i, estadoNuevo) {
  const lista = obtenerTraslados();
  lista[i].estado = estadoNuevo;
  guardarTraslados(lista);
  pintarLista();
}

pintarLista();
