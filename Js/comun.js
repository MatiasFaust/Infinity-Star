

function pedir(url) {
    return fetch(url).then(r => r.json());
}

function botonAccion(accion, id, texto, clase, extra) {
    let campos = "<input type='hidden' name='id' value='" + id + "'>";

    for (const nombre in extra) {
        campos += "<input type='hidden' name='" + nombre + "' value='" + extra[nombre] + "'>";
    }

    return "<form class='enLinea' method='POST' action='../../" + accion + "'>" +
           campos +
           "<button type='submit' class='" + clase + "'>" + texto + "</button>" +
           "</form>";
}

function fechaCorta(texto) {
    if (!texto) { return ""; }

    const [dia, hora] = texto.split(" ");
    const [a, m, d] = dia.split("-");

    return d + "/" + m + "/" + a + " " + hora.slice(0, 5);
}

function aReloj(segundos) {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    return String(h).padStart(2, "0") + ":" +
           String(m).padStart(2, "0") + ":" +
           String(s).padStart(2, "0");
}

function colorEstado(estado) {
    if (estado === "En curso")   { return "curso"; }
    if (estado === "Finalizado") { return "finalizado"; }
    return "pendiente";
}

function filtrar(lista, texto, campos) {
    const busqueda = texto.toLowerCase();

    return lista.filter(item =>
        campos.map(c => item[c] || "").join(" ").toLowerCase().includes(busqueda));
}

function marcarActivo() {
    const pagina = location.pathname.split("/").pop();

    for (const enlace of document.querySelectorAll("nav a")) {
        const destino = enlace.getAttribute("href").split("?")[0];
        enlace.classList.toggle("activo", destino === pagina);
    }
}

function avisosDeLaDireccion() {
    const mensajes = {
        guardado: "Guardado correctamente.",
        borrada: "Eliminado correctamente.",
        token: "El token de acceso no es correcto.",
        correo: "Ese correo ya está registrado con otra cédula.",
        usada: "No se puede eliminar: hay traslados que usan esa ambulancia."
    };

    const aviso = document.getElementById("aviso");
    const direccion = new URLSearchParams(location.search);

    if (!aviso) { return; }

    for (const clave in mensajes) {
        if (direccion.has(clave) || direccion.get("error") === clave) {
            aviso.textContent = mensajes[clave];
            aviso.hidden = false;
            return;
        }
    }
}

function ponerOjitos() {
    for (const clave of document.querySelectorAll("input[type='password']")) {
        const marco = document.createElement("div");
        marco.className = "conOjo";
        clave.parentNode.insertBefore(marco, clave);
        marco.appendChild(clave);

        const ojo = document.createElement("button");
        ojo.type = "button";
        ojo.className = "ojo";
        ojo.textContent = "👁";
        ojo.title = "Ver contraseña";
        marco.appendChild(ojo);

        ojo.addEventListener("click", function () {
            const oculta = clave.type === "password";
            clave.type = oculta ? "text" : "password";
            ojo.textContent = oculta ? "🙈" : "👁";
            ojo.title = oculta ? "Ocultar contraseña" : "Ver contraseña";
        });
    }
}

async function prepararIdioma() {
    const boton = document.querySelector(".idioma");

    if (!boton) { return; }

    const diccionario = await pedir(boton.dataset.traducciones);
    const alEspanol = {};

    for (const palabra in diccionario) {
        alEspanol[diccionario[palabra]] = palabra;
    }

    function traducirTexto(nodo, tabla) {
        const original = nodo.nodeValue.trim();
        const limpio = original.replace(/\s+/g, " ");
        if (tabla[limpio]) {
            nodo.nodeValue = nodo.nodeValue.replace(original, tabla[limpio]);
        }
    }

    function traducir(raiz, tabla) {
        for (const elemento of [raiz, ...raiz.querySelectorAll("*")]) {
            for (const hijo of elemento.childNodes) {
                if (hijo.nodeType === 3) { traducirTexto(hijo, tabla); }
            }
            for (const atributo of ["placeholder", "title"]) {
                if (tabla[elemento[atributo]]) { elemento[atributo] = tabla[elemento[atributo]]; }
            }
        }
    }

    let enIngles = localStorage.getItem("idioma") === "en";

    if (enIngles) { traducir(document.body, diccionario); }

    boton.textContent = enIngles ? "ES" : "EN";

    boton.addEventListener("click", function () {
        enIngles = !enIngles;
        traducir(document.body, enIngles ? diccionario : alEspanol);
        localStorage.setItem("idioma", enIngles ? "en" : "es");
        boton.textContent = enIngles ? "ES" : "EN";
    });

    new MutationObserver(function (cambios) {
        if (!enIngles) { return; }
        for (const cambio of cambios) {
            for (const nodo of cambio.addedNodes) {
                if (nodo.nodeType === 1) { traducir(nodo, diccionario); }
                if (nodo.nodeType === 3) { traducirTexto(nodo, diccionario); }
            }
        }
    }).observe(document.body, { childList: true, subtree: true });
}

marcarActivo();
avisosDeLaDireccion();
ponerOjitos();
window.addEventListener("load", prepararIdioma);
