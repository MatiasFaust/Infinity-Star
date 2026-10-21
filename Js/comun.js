function raizDelSitio() {
    const partes = location.pathname.split("/Html/");

    if (partes.length > 1) {
        return partes[0];
    }

    // Si la pagina esta en la raiz no hay /Html/, entonces le saco el nombre del archivo.
    return location.pathname.substring(0, location.pathname.lastIndexOf("/"));
}

async function revisarSesion() {
    const raiz = raizDelSitio();
    const respuesta = await fetch(raiz + "/Api/sesion.php", { cache: "no-store" });
    const hay = await respuesta.text();

    if (hay != "1") {
        window.location.replace(raiz + "/Index.html");
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
    texto = enIdioma(texto);

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

function horaOGuion(texto) {
    if (!texto) {
        return "-";
    }

    return fechaCorta(texto);
}



function sinTildes(texto) {
    texto = texto.toLowerCase();

    texto = texto.replace(/á/g, "a");
    texto = texto.replace(/é/g, "e");
    texto = texto.replace(/í/g, "i");
    texto = texto.replace(/ó/g, "o");
    texto = texto.replace(/ú/g, "u");
    texto = texto.replace(/ü/g, "u");
    texto = texto.replace(/ñ/g, "n");

    return texto;
}

function filtrar(lista, texto, campos) {
    const busqueda = sinTildes(texto);
    const resultado = [];

    for (let i = 0; i < lista.length; i++) {
        let todo = "";

        for (let j = 0; j < campos.length; j++) {
            const valor = lista[i][campos[j]];
            if (valor) {
                todo = todo + " " + valor;
            }
        }

        if (sinTildes(todo).indexOf(busqueda) != -1) {
            resultado.push(lista[i]);
        }
    }

    return resultado;
}

function prepararBuscadorDePacientes() {
    const campo = document.getElementById("buscarPaciente");

    if (!campo) {
        return;
    }

    const lista = document.getElementById("resultadosPaciente");
    const elegido = document.getElementById("paciente");
    const aviso = document.getElementById("pacienteElegido");

    async function buscar() {
        const texto = campo.value.trim();

        lista.innerHTML = "";

        if (texto.length < 2) {
            return;
        }

        const encontrados = await pedir(raizDelSitio() + "/Api/usuarios.php?tipo=buscarPaciente&q=" + encodeURIComponent(texto));

        if (encontrados.length == 0) {
            lista.innerHTML = "<p class='ayuda'>" + enIdioma("No se encontró ningún paciente con eso.") + "</p>";
            return;
        }

        for (let i = 0; i < encontrados.length; i++) {
            const p = encontrados[i];

            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "resultado";
            boton.textContent = p.apellido + ", " + p.nombre + "  -  " + enIdioma("Cédula") + " " + p.cedula;

            boton.addEventListener("click", function () {
                elegido.value = p.idPaciente;
                aviso.textContent = enIdioma("Paciente elegido:") + " " + p.nombre + " " + p.apellido + " (" + p.cedula + ")";
                aviso.hidden = false;
                lista.innerHTML = "";
                campo.value = "";
            });

            lista.appendChild(boton);
        }
    }

    campo.addEventListener("input", buscar);
}

function armarCartelDelToken() {
    const fondo = document.createElement("div");
    fondo.className = "fondoCartel";
    fondo.hidden = true;

    const cartel = document.createElement("div");
    cartel.className = "cartel";

    const titulo = document.createElement("h2");
    titulo.textContent = enIdioma("Hace falta el token de borrado");

    const texto = document.createElement("p");
    texto.className = "ayuda";
    texto.textContent = enIdioma("Esta acción no se puede deshacer. Escribí el token para confirmar.");

    const campo = document.createElement("input");
    campo.type = "password";
    campo.id = "tokenDelCartel";
    campo.placeholder = enIdioma("Token de borrado");

    const botones = document.createElement("div");
    botones.className = "botones";

    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.className = "secundario";
    cancelar.textContent = enIdioma("Cancelar");

    const borrar = document.createElement("button");
    borrar.type = "button";
    borrar.className = "eliminar";
    borrar.textContent = enIdioma("Eliminar");

    botones.appendChild(cancelar);
    botones.appendChild(borrar);

    cartel.appendChild(titulo);
    cartel.appendChild(texto);
    cartel.appendChild(campo);
    cartel.appendChild(botones);
    fondo.appendChild(cartel);

    document.body.appendChild(fondo);

    return { fondo: fondo, campo: campo, cancelar: cancelar, borrar: borrar };
}

function pedirTokenAlBorrar() {
    const cartel = armarCartelDelToken();
    let formularioEnEspera = null;

    function cerrar() {
        cartel.fondo.hidden = true;
        cartel.campo.value = "";
        formularioEnEspera = null;
    }

    cartel.cancelar.addEventListener("click", cerrar);

    cartel.fondo.addEventListener("click", function (evento) {
        if (evento.target == cartel.fondo) {
            cerrar();
        }
    });

    cartel.borrar.addEventListener("click", function () {
        if (!formularioEnEspera || cartel.campo.value == "") {
            return;
        }

        const campo = document.createElement("input");
        campo.type = "hidden";
        campo.name = "tokenBorrado";
        campo.value = cartel.campo.value;

        formularioEnEspera.appendChild(campo);
        formularioEnEspera.submit();
    });

    document.addEventListener("submit", function (evento) {
        const formulario = evento.target;
        const accion = formulario.getAttribute("action");

        if (!accion) {
            return;
        }

        if (accion.indexOf("borrar.php") == -1) {
            return;
        }

        const pideToken = accion.indexOf("que=persona") != -1 ||
                          accion.indexOf("que=docPaciente") != -1 ||
                          accion.indexOf("que=documento") != -1 ||
                          accion.indexOf("que=ambulancia") != -1;

        if (!pideToken) {
            return;
        }

        if (formulario.querySelector("input[name='tokenBorrado']")) {
            return;
        }

        evento.preventDefault();

        formularioEnEspera = formulario;
        cartel.fondo.hidden = false;
        cartel.campo.focus();
    });
}

function aplicarTema() {
    if (localStorage.getItem("tema") == "oscuro") {
        document.documentElement.classList.add("oscuro");
    }
}

function ponerPie() {
    if (document.querySelector(".pie")) {
        return;
    }

    const pie = document.createElement("div");
    pie.className = "pie";

    const fila = document.createElement("div");
    fila.className = "logosDelPie";

    const estrella = document.createElement("img");
    estrella.src = raizDelSitio() + "/Img/infinitystar.png";
    estrella.alt = "Infinity Star";
    estrella.className = "logoChico";

    const escuela = document.createElement("img");
    escuela.src = raizDelSitio() + "/Img/logos.png";
    escuela.alt = "ANEP - UTU - Escuela Superior de Comunicación Social y Diseño Gráfico";

    fila.appendChild(estrella);
    fila.appendChild(escuela);

    const texto = document.createElement("p");
    texto.textContent = "Hospital de Clínicas Montevideo";

    pie.appendChild(fila);
    pie.appendChild(texto);

    document.body.appendChild(pie);
}

function ponerBotonTema() {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "tema";

    // Dibujamos la luna y el sol a mano, con un icono. Los emojis se ven
    // distintos en cada computadora y quedaban feos.
    const luna = "<svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>" +
                 "<path fill='currentColor' d='M21 13.2A9 9 0 1 1 10.8 3a7.2 7.2 0 0 0 10.2 10.2z'/></svg>";

    const sol = "<svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>" +
                "<circle cx='12' cy='12' r='4.6' fill='currentColor'/>" +
                "<g stroke='currentColor' stroke-width='2' stroke-linecap='round'>" +
                "<path d='M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22'/>" +
                "<path d='M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9'/>" +
                "</g></svg>";

    function pintarBoton() {
        const estaOscuro = document.documentElement.classList.contains("oscuro");

        boton.innerHTML = estaOscuro ? sol : luna;
        boton.title = enIdioma(estaOscuro ? "Pasar a modo claro" : "Pasar a modo oscuro");
        boton.setAttribute("aria-label", boton.title);
    }

    boton.addEventListener("click", function () {
        document.documentElement.classList.toggle("oscuro");

        if (document.documentElement.classList.contains("oscuro")) {
            localStorage.setItem("tema", "oscuro");
        } else {
            localStorage.setItem("tema", "claro");
        }

        pintarBoton();
    });

    pintarBoton();

    document.body.appendChild(boton);
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

    if (direccion.get("error") == "entrar") {
        mensaje = "Usuario o contraseña incorrectos. Fijate que estén bien escritos.";
    } else if (direccion.get("error") == "suspendido") {
        mensaje = "Tu usuario está suspendido. Hablá con el superadministrador.";
    } else if (direccion.has("guardado")) {
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
    } else if (direccion.get("error") == "sinPreguntas") {
        mensaje = "Escribí al menos una pregunta para la encuesta.";
    } else if (direccion.get("error") == "noEsPaciente") {
        mensaje = "Esa cédula no está registrada como paciente del hospital.";
    } else if (direccion.get("error") == "yaRespondio") {
        mensaje = "Con esa cédula ya se respondió esta encuesta.";
    } else if (direccion.get("error") == "sinTitulo") {
        mensaje = "Elegí o escribí el nombre del documento.";
    } else if (direccion.get("error") == "noEsPdf") {
        mensaje = "El archivo tiene que ser un PDF.";
    } else if (direccion.get("error") == "archivoGrande") {
        mensaje = "No se pudo subir el archivo. Fijate que sea un PDF de menos de 40 MB.";
    } else if (direccion.get("error") == "noSeGuardo") {
        mensaje = "No se pudo guardar el archivo en el servidor.";
    } else if (direccion.get("error") == "sinCodigo") {
        mensaje = "Escribí el código del token.";
    } else if (direccion.get("error") == "tokenRepetido") {
        mensaje = "Ese token ya existe.";
    } else if (direccion.get("error") == "ultimoToken") {
        mensaje = "No se puede borrar el único token que queda.";
    } else if (direccion.get("error") == "vosMismo") {
        mensaje = "No podés suspenderte ni eliminarte a vos mismo.";
    } else if (direccion.get("error") == "tokenBorrado") {
        mensaje = "El token de borrado no es correcto.";
    } else if (direccion.has("sustituido")) {
        mensaje = "Listo, cambiamos el archivo. El QR que ya imprimiste sigue sirviendo.";
    } else if (direccion.get("credenciales") == "anotalas") {
        mensaje = "Guardado. Anotá el usuario y la contraseña que escribiste y pasáselos, porque después no se pueden ver.";
    } else if (direccion.get("clave") == "cambiada") {
        mensaje = "Tu contraseña se cambió. Ya podés entrar.";
    } else if (direccion.get("error") == "claveCorta") {
        mensaje = "La contraseña tiene que tener al menos 8 letras o números.";
    } else if (direccion.get("error") == "mismaClave") {
        mensaje = "La contraseña nueva tiene que ser distinta a la actual.";
    } else if (direccion.get("error") == "claveActual") {
        mensaje = "La contraseña actual no es correcta.";
    } else if (direccion.get("error") == "noCoinciden") {
        mensaje = "Las contraseñas nuevas no coinciden.";
    } else if (direccion.get("error") == "enlaceVencido") {
        mensaje = "Ese enlace ya se usó o venció. Pedí uno nuevo.";
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
        aviso.textContent = enIdioma(mensaje);
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
        ojo.title = enIdioma("Ver contraseña");
        marco.appendChild(ojo);

        ojo.addEventListener("click", function () {
            if (clave.type == "password") {
                clave.type = "text";
                ojo.classList.add("tachado");
                ojo.title = enIdioma("Ocultar contraseña");
            } else {
                clave.type = "password";
                ojo.classList.remove("tachado");
                ojo.title = enIdioma("Ver contraseña");
            }
        });
    }
}

let tablaIdioma = {};
let tablaAlEspanol = {};
let yaTraducido = false;

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

function armarVuelta(diccionario) {
    const vuelta = {};

    for (const palabra in diccionario) {
        vuelta[diccionario[palabra]] = palabra;
    }

    return vuelta;
}

function diccionarioGuardado() {
    try {
        return JSON.parse(localStorage.getItem("diccionario"));
    } catch (error) {
        return null;
    }
}

function traducirApenasCarga() {
    if (localStorage.getItem("idioma") != "en") {
        return;
    }

    const diccionario = diccionarioGuardado();

    if (!diccionario) {
        return;
    }

    tablaIdioma = diccionario;
    tablaAlEspanol = armarVuelta(diccionario);

    traducir(document.body, diccionario);

    yaTraducido = true;
}

async function prepararIdioma() {
    const boton = document.querySelector(".idioma");

    if (!boton) {
        return;
    }

    const diccionario = await pedir(boton.dataset.traducciones);

    localStorage.setItem("diccionario", JSON.stringify(diccionario));

    tablaAlEspanol = armarVuelta(diccionario);

    let enIngles = localStorage.getItem("idioma") == "en";
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

    if (enIngles) {
        tablaIdioma = diccionario;

        if (!yaTraducido) {
            traducir(document.body, diccionario);
            yaTraducido = true;
        }

        boton.textContent = "ES";
    } else {
        boton.textContent = "EN";
    }

    boton.addEventListener("click", function () {
        if (enIngles) {
            tablaIdioma = {};
            traducirTodo(tablaAlEspanol);
            localStorage.setItem("idioma", "es");
            boton.textContent = "EN";
            enIngles = false;
            yaTraducido = false;
        } else {
            tablaIdioma = diccionario;
            traducirTodo(diccionario);
            localStorage.setItem("idioma", "en");
            boton.textContent = "ES";
            enIngles = true;
            yaTraducido = true;
        }

        avisarCambioDeIdioma();
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

function soloNumeros(campo, cuantos) {
    const avisos = ["input", "change", "blur"];

    for (let i = 0; i < avisos.length; i++) {
        campo.addEventListener(avisos[i], function () {
            campo.value = campo.value.replace(/[^0-9]/g, "").substring(0, cuantos);
        });
    }
}

function soloLetras(campo) {
    const avisos = ["input", "change", "blur"];

    for (let i = 0; i < avisos.length; i++) {
        campo.addEventListener(avisos[i], function () {
            campo.value = campo.value.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, "");
        });
    }
}

function vaciarBuscadores() {
    // Los buscadores y los campos de los formularios que Chrome insiste
    // en rellenar con datos guardados de otras páginas.
    const campos = document.querySelectorAll(".buscar, #buscarPaciente, .sinRelleno input");

    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i];

        // Los ocultos y los botones no se tocan: ahí van datos que manda el
        // formulario, como el rol o a dónde volver.
        if (campo.type == "hidden" || campo.type == "submit" ||
            campo.type == "button" || campo.type == "radio" ||
            campo.type == "checkbox" || campo.type == "file") {
            continue;
        }

        campo.setAttribute("autocomplete", "off");

        // Chrome no rellena solo los campos de solo lectura, asi que lo dejamos
        // asi hasta que la persona lo toca. Ahi recien se puede escribir.
        if (!campo.dataset.cuidado) {
            campo.dataset.cuidado = "si";
            campo.readOnly = true;

            if (!campo.dataset.restaurado) {
                campo.value = "";
            }

            campo.addEventListener("focus", function () {
                campo.readOnly = false;
            });
        }

        // Si todavia no lo tocaron y el navegador le metio algo, lo sacamos.
        // Salvo que seamos nosotros los que le devolvimos lo que habia escrito.
        if (campo.readOnly && !campo.dataset.restaurado) {
            campo.value = "";
        }
    }
}


// ---- Lo que quedó escrito sin guardar ----
// En cualquier panel: si alguien llena un formulario y se va a otra pantalla,
// al volver le dejamos todo como estaba. Se borra cuando guarda de verdad.

function laLlaveDelFormulario(formulario) {
    return "aMedias:" + location.pathname + ":" + (formulario.getAttribute("action") || "");
}

function camposQueSeRecuerdan(formulario) {
    const todos = formulario.querySelectorAll("input, select, textarea");
    const sirven = [];

    for (let i = 0; i < todos.length; i++) {
        const campo = todos[i];

        // Las contraseñas no se guardan nunca. Los ocultos tampoco, porque
        // llevan cosas como el paciente elegido y se prestan a confusión.
        if (campo.type == "password" || campo.type == "file" ||
            campo.type == "hidden" || campo.type == "submit" ||
            campo.type == "button" || !campo.name) {
            continue;
        }

        sirven.push(campo);
    }

    return sirven;
}

function recordarFormularios() {
    const formularios = document.querySelectorAll("form[data-recordar]");

    for (let i = 0; i < formularios.length; i++) {
        const formulario = formularios[i];
        const llave = laLlaveDelFormulario(formulario);
        const campos = camposQueSeRecuerdan(formulario);

        let guardado = null;

        try {
            guardado = JSON.parse(localStorage.getItem(llave));
        } catch (error) {
            guardado = null;
        }

        for (let j = 0; j < campos.length; j++) {
            const campo = campos[j];

            if (guardado && guardado[campo.name] !== undefined && guardado[campo.name] !== "") {
                campo.value = guardado[campo.name];
                campo.dataset.restaurado = "si";
            }

            campo.addEventListener("input", function () {
                guardarFormulario(formulario);
            });

            campo.addEventListener("change", function () {
                guardarFormulario(formulario);
            });
        }

        formulario.addEventListener("submit", function () {
            localStorage.removeItem(llave);
        });
    }
}

function guardarFormulario(formulario) {
    const campos = camposQueSeRecuerdan(formulario);
    const guardado = {};

    for (let i = 0; i < campos.length; i++) {
        guardado[campos[i].name] = campos[i].value;
    }

    localStorage.setItem(laLlaveDelFormulario(formulario), JSON.stringify(guardado));
}

// En el celular las tablas se muestran como tarjetas, una fila abajo de la otra.
// Para que se entienda qué es cada dato, a cada celda le copiamos el título
// de su columna.
function etiquetarTablas() {
    const tablas = document.querySelectorAll(".tabla table");

    for (let i = 0; i < tablas.length; i++) {
        const titulos = tablas[i].querySelectorAll("thead th");
        const filas = tablas[i].querySelectorAll("tbody tr");

        for (let j = 0; j < filas.length; j++) {
            const celdas = filas[j].querySelectorAll("td");

            for (let k = 0; k < celdas.length; k++) {
                if (titulos[k]) {
                    celdas[k].setAttribute("data-titulo", titulos[k].textContent.trim());
                }
            }
        }
    }
}

// Las filas se cargan después, así que volvemos a etiquetar cada vez que cambian.
function vigilarTablas() {
    etiquetarTablas();

    const cuerpos = document.querySelectorAll(".tabla tbody");

    for (let i = 0; i < cuerpos.length; i++) {
        const miron = new MutationObserver(etiquetarTablas);
        miron.observe(cuerpos[i], { childList: true });
    }
}

// Buscador para las listas desplegables largas, como la de choferes o la de
// pacientes. Al campo se le pone data-lista="idDeLaLista" y deja solo las
// opciones que coinciden con lo que se escribe.
function prepararBuscadoresDeLista() {
    const campos = document.querySelectorAll("[data-lista]");

    for (let i = 0; i < campos.length; i++) {
        const campo = campos[i];
        const lista = document.getElementById(campo.dataset.lista);

        if (!lista) {
            continue;
        }

        let todas = null;

        campo.addEventListener("input", function () {
            // Las opciones se cargan después, así que las guardamos la primera
            // vez que alguien escribe, cuando ya están todas.
            if (!todas) {
                todas = [];

                for (let j = 0; j < lista.options.length; j++) {
                    todas.push({ valor: lista.options[j].value,
                                 texto: lista.options[j].textContent });
                }
            }

            const texto = sinTildes(campo.value.toLowerCase().trim());
            const elegido = lista.value;

            lista.innerHTML = "";

            for (let j = 0; j < todas.length; j++) {
                const o = todas[j];
                const entra = (texto == "" || o.valor == "" ||
                               sinTildes(o.texto.toLowerCase()).indexOf(texto) != -1);

                if (entra) {
                    const opcion = document.createElement("option");
                    opcion.value = o.valor;
                    opcion.textContent = o.texto;
                    lista.appendChild(opcion);
                }
            }

            lista.value = elegido;

            // Si lo que estaba elegido ya no entra en la búsqueda y quedó una
            // sola opción de verdad, la dejamos elegida.
            if (lista.value == "" && lista.options.length == 2) {
                lista.selectedIndex = 1;
            }
        });
    }
}

// Filtro simple para cualquier tabla: al buscador se le pone
// data-tabla="idDelCuerpoDeLaTabla" y esconde las filas que no coinciden.
function prepararFiltrosDeTabla() {
    const buscadores = document.querySelectorAll("[data-tabla]");

    for (let i = 0; i < buscadores.length; i++) {
        const campo = buscadores[i];
        const cuerpo = document.getElementById(campo.dataset.tabla);

        if (!cuerpo) {
            continue;
        }

        campo.addEventListener("input", function () {
            const texto = sinTildes(campo.value.toLowerCase().trim());
            const filas = cuerpo.querySelectorAll("tr");

            for (let j = 0; j < filas.length; j++) {
                const contenido = sinTildes(filas[j].textContent.toLowerCase());

                filas[j].hidden = (texto != "" && contenido.indexOf(texto) == -1);
            }
        });
    }
}

function limpiarLoQueNoVa() {
    const numericos = document.querySelectorAll("input[name='cedula'], input[name='telefono'], input[name='copilotoCedula']");

    for (let i = 0; i < numericos.length; i++) {
        numericos[i].setAttribute("autocomplete", "off");
        numericos[i].value = numericos[i].value.replace(/[^0-9]/g, "");
    }

    const deLetras = document.querySelectorAll("input[name='nombre'], input[name='apellido'], input[name='copilotoNombre'], input[name='copilotoApellido']");

    for (let i = 0; i < deLetras.length; i++) {
        deLetras[i].setAttribute("autocomplete", "off");
        deLetras[i].value = deLetras[i].value.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, "");
    }
}

function ordenarCampos() {
    vaciarBuscadores();
    limpiarLoQueNoVa();
}

function vaciarBuscadoresVariasVeces() {
    ordenarCampos();

    window.addEventListener("load", ordenarCampos);
    window.addEventListener("pageshow", ordenarCampos);

    const momentos = [50, 150, 300, 600, 1000, 1800, 3000];

    for (let i = 0; i < momentos.length; i++) {
        setTimeout(ordenarCampos, momentos[i]);
    }
}

function limitarCampos() {
    const cedulas = document.querySelectorAll("input[name='cedula']");

    for (let i = 0; i < cedulas.length; i++) {
        soloNumeros(cedulas[i], 8);
    }

    const nombres = document.querySelectorAll("input[name='nombre'], input[name='apellido'], input[name='copilotoNombre'], input[name='copilotoApellido']");

    for (let i = 0; i < nombres.length; i++) {
        soloLetras(nombres[i]);
    }

    const telefonos = document.querySelectorAll("input[name='telefono'], input[name='copilotoCedula']");

    for (let i = 0; i < telefonos.length; i++) {
        soloNumeros(telefonos[i], 15);
    }
}

aplicarTema();
traducirApenasCarga();
marcarActivo();
avisosDeLaDireccion();
ponerOjitos();
limitarCampos();
vaciarBuscadoresVariasVeces();
ponerBotonTema();
ponerPie();
pedirTokenAlBorrar();
prepararBuscadorDePacientes();
prepararFiltrosDeTabla();
prepararBuscadoresDeLista();
vigilarTablas();
recordarFormularios();
window.addEventListener("load", prepararIdioma);
