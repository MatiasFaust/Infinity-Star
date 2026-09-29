async function revisarSesion() {
    const respuesta = await fetch("/Web/Api/sesion.php", { cache: "no-store" });
    const hay = await respuesta.text();

    if (hay != "1") {
        window.location.replace("/Web/Index.html");
    }
}

if (window.location.pathname.includes("/Html/")) {
    window.addEventListener("pageshow", revisarSesion);
}

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
    } else if (direccion.get("error") == "matricula") {
        mensaje = "Esa matrícula ya está registrada.";
    } else if (direccion.get("error") == "mismaRuta") {
        mensaje = "El origen y el destino no pueden ser el mismo punto.";
    } else if (direccion.get("error") == "sinMarcar") {
        mensaje = "Marcá el origen y el destino en el mapa antes de guardar.";
    } else if (direccion.get("error") == "rutaRepetida") {
        mensaje = "Esa ruta ya está asignada a esa ambulancia.";
    } else if (direccion.get("error") == "rutaUsada") {
        mensaje = "No se puede eliminar: hay traslados que usan esa ruta.";
    } else if (direccion.get("error") == "sinRuta") {
        mensaje = "Elegí una ruta para el traslado.";
    } else if (direccion.get("error") == "horas") {
        mensaje = "La hora de llegada tiene que ser posterior a la de salida.";
    } else if (direccion.get("error") == "sinPaciente") {
        mensaje = "Elegí el paciente que se traslada.";
    } else if (direccion.get("error") == "sinElemento") {
        mensaje = "Escribí qué elemento se traslada.";
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

let tablaIdioma = {};

const alCambiarIdioma = [];

function avisarCambioDeIdioma() {
    for (let i = 0; i < alCambiarIdioma.length; i++) {
        alCambiarIdioma[i]();
    }
}

function enIdioma(texto) {
    if (tablaIdioma[texto]) {
        return tablaIdioma[texto];
    }

    return texto;
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

    let vigilante = null;

    function traducirTodo(tabla) {
        if (vigilante) {
            vigilante.disconnect();
        }

        traducir(document.body, tabla);

        if (vigilante) {
            vigilante.observe(document.body, { childList: true, subtree: true });
        }
    }

    let enIngles = localStorage.getItem("idioma") == "en";

    if (enIngles) {
        tablaIdioma = diccionario;
        traducirTodo(diccionario);
        boton.textContent = "ES";
    } else {
        boton.textContent = "EN";
    }

    boton.addEventListener("click", function () {
        if (enIngles) {
            tablaIdioma = {};
            traducirTodo(alEspanol);
            localStorage.setItem("idioma", "es");
            boton.textContent = "EN";
            enIngles = false;
            avisarCambioDeIdioma();
        } else {
            tablaIdioma = diccionario;
            traducirTodo(diccionario);
            localStorage.setItem("idioma", "en");
            boton.textContent = "ES";
            enIngles = true;
            avisarCambioDeIdioma();
        }
    });

    vigilante = new MutationObserver(function (cambios) {
        if (!enIngles) {
            return;
        }

        vigilante.disconnect();

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

        vigilante.observe(document.body, { childList: true, subtree: true });
    });

    vigilante.observe(document.body, { childList: true, subtree: true });
}

function limitarCampos() {
    const cedula = document.querySelector("input[name='cedula']");
    const nombres = document.querySelectorAll("input[name='nombre'], input[name='apellido']");

    if (cedula) {
        cedula.addEventListener("input", function () {
            cedula.value = cedula.value.replace(/[^0-9]/g, "").substring(0, 8);
        });
    }

    for (let i = 0; i < nombres.length; i++) {
        nombres[i].addEventListener("input", function () {
            this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, "");
        });
    }
}

marcarActivo();
avisosDeLaDireccion();
ponerOjitos();
limitarCampos();
window.addEventListener("load", prepararIdioma);
