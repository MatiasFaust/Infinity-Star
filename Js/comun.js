async function pedir(url) {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos;
}

function botonAccion(accion, id, texto, clase, extra) {
    let campos = "<input type='hidden' name='id' value='" + id + "'>";

    if (extra) {
        for (const nombre in extra) {
            campos = campos + "<input type='hidden' name='" + nombre + "' value='" + extra[nombre] + "'>";
        }
    }

    let html = "<form class='enLinea' method='POST' action='../../" + accion + "'>";
    html = html + campos;
    html = html + "<button type='submit' class='" + clase + "'>" + texto + "</button>";
    html = html + "</form>";

    return html;
}

function fechaCorta(texto) {
    if (!texto) {
        return "";
    }

    const partes = texto.split(" ");
    const fecha = partes[0].split("-");
    const hora = partes[1].substring(0, 5);

    return fecha[2] + "/" + fecha[1] + "/" + fecha[0] + " " + hora;
}

function dosDigitos(numero) {
    if (numero < 10) {
        return "0" + numero;
    }
    return "" + numero;
}

function aReloj(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const resto = segundos % 60;

    return dosDigitos(horas) + ":" + dosDigitos(minutos) + ":" + dosDigitos(resto);
}

function colorEstado(estado) {
    if (estado == "En curso") {
        return "curso";
    }
    if (estado == "Finalizado") {
        return "finalizado";
    }
    return "pendiente";
}

function filtrar(lista, texto, campos) {
    const busqueda = texto.toLowerCase();
    const resultado = [];

    for (let i = 0; i < lista.length; i++) {
        let todo = "";

        for (let j = 0; j < campos.length; j++) {
            const valor = lista[i][campos[j]];
            if (valor) {
                todo = todo + " " + valor;
            }
        }

        if (todo.toLowerCase().indexOf(busqueda) != -1) {
            resultado.push(lista[i]);
        }
    }

    return resultado;
}

function marcarActivo() {
    const partes = location.pathname.split("/");
    const pagina = partes[partes.length - 1];
    const enlaces = document.querySelectorAll("nav a");

    for (let i = 0; i < enlaces.length; i++) {
        const destino = enlaces[i].getAttribute("href").split("?")[0];

        if (destino == pagina) {
            enlaces[i].classList.add("activo");
        } else {
            enlaces[i].classList.remove("activo");
        }
    }
}

function avisosDeLaDireccion() {
    const aviso = document.getElementById("aviso");

    if (!aviso) {
        return;
    }

    const direccion = new URLSearchParams(location.search);
    let mensaje = "";

    if (direccion.has("guardado")) {
        mensaje = "Guardado correctamente.";
    } else if (direccion.has("borrada")) {
        mensaje = "Eliminado correctamente.";
    } else if (direccion.get("error") == "token") {
        mensaje = "El token de acceso no es correcto.";
    } else if (direccion.get("error") == "correo") {
        mensaje = "Ese correo ya está registrado con otra cédula.";
    } else if (direccion.get("error") == "usada") {
        mensaje = "No se puede eliminar: hay traslados que usan esa ambulancia.";
    } else if (direccion.get("error") == "usuario") {
        mensaje = "Ese nombre de usuario ya está en uso.";
    } else if (direccion.get("error") == "cedula") {
        mensaje = "Esa cédula ya está registrada en otra persona.";
    } else if (direccion.get("error") == "cedulaMal") {
        mensaje = "La cédula tiene que ser solo números.";
    } else if (direccion.get("error") == "matricula") {
        mensaje = "Esa matrícula ya está registrada.";
    }

    if (mensaje != "") {
        aviso.textContent = mensaje;
        aviso.hidden = false;
    }
}

function ponerOjitos() {
    const claves = document.querySelectorAll("input[type='password']");

    for (let i = 0; i < claves.length; i++) {
        const clave = claves[i];

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
            if (clave.type == "password") {
                clave.type = "text";
                ojo.classList.add("tachado");
                ojo.title = "Ocultar contraseña";
            } else {
                clave.type = "password";
                ojo.classList.remove("tachado");
                ojo.title = "Ver contraseña";
            }
        });
    }
}

async function prepararIdioma() {
    const boton = document.querySelector(".idioma");

    if (!boton) {
        return;
    }

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

    function traducirElemento(elemento, tabla) {
        const hijos = elemento.childNodes;

        for (let i = 0; i < hijos.length; i++) {
            if (hijos[i].nodeType == 3) {
                traducirTexto(hijos[i], tabla);
            }
        }

        if (elemento.placeholder && tabla[elemento.placeholder]) {
            elemento.placeholder = tabla[elemento.placeholder];
        }

        if (elemento.title && tabla[elemento.title]) {
            elemento.title = tabla[elemento.title];
        }
    }

    function traducir(raiz, tabla) {
        traducirElemento(raiz, tabla);

        const elementos = raiz.querySelectorAll("*");

        for (let i = 0; i < elementos.length; i++) {
            traducirElemento(elementos[i], tabla);
        }
    }

    let enIngles = localStorage.getItem("idioma") == "en";

    if (enIngles) {
        traducir(document.body, diccionario);
        boton.textContent = "ES";
    } else {
        boton.textContent = "EN";
    }

    boton.addEventListener("click", function () {
        if (enIngles) {
            traducir(document.body, alEspanol);
            localStorage.setItem("idioma", "es");
            boton.textContent = "EN";
            enIngles = false;
        } else {
            traducir(document.body, diccionario);
            localStorage.setItem("idioma", "en");
            boton.textContent = "ES";
            enIngles = true;
        }
    });

    const vigilante = new MutationObserver(function (cambios) {
        if (!enIngles) {
            return;
        }

        for (let i = 0; i < cambios.length; i++) {
            const nuevos = cambios[i].addedNodes;

            for (let j = 0; j < nuevos.length; j++) {
                if (nuevos[j].nodeType == 1) {
                    traducir(nuevos[j], diccionario);
                }
                if (nuevos[j].nodeType == 3) {
                    traducirTexto(nuevos[j], diccionario);
                }
            }
        }
    });

    vigilante.observe(document.body, { childList: true, subtree: true });
}

marcarActivo();
avisosDeLaDireccion();
ponerOjitos();
window.addEventListener("load", prepararIdioma);
