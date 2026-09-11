# Guía para la defensa — Sistema del Hospital de Clínicas Montevideo

Esta guía explica el proyecto tal como está hoy, para poder contestar cualquier pregunta
sobre cómo funciona y por qué está hecho así.


## 1. Qué es el proyecto

Es un sistema web para el hospital con dos módulos:

- **Documentos**: registrar pacientes, funcionarios y choferes. La pantalla Documentos
  va a generar el documento de cada paciente con su código QR (todavía no está hecha).
- **Traslados**: cargar ambulancias, ver los traslados y un panel para el chofer con
  un temporizador que mide cuánto dura cada recorrido.

Para esta entrega está **en pausa** el alta de traslados, el panel del chofer con el temporizador,
la parte de documentos y la recuperación de contraseña por mail. Todo ese código está guardado fuera del proyecto, en `Escritorio/Web-pausado`. El resto funciona.

Tecnologías: **HTML, CSS y JavaScript** en el navegador, **PHP** en el servidor y
**MySQL** (MariaDB) como base de datos, todo corriendo en **XAMPP**.


## 2. Cómo está organizado

```
Web/
├── Index.html            login
├── registrar.html        registro público (funcionario o chofer con clave de acceso)
├── login.php             comprueba usuario y contraseña
├── guardar.php           alta de persona (desde el panel o desde el registro público) y de ambulancia
├── actualizar.php        edición de persona y ambulancia
├── borrar.php            baja de persona, traslado, ambulancia
├── config.php            datos de la base (servidor, usuario, contraseña, nombre)
├── conexion.php          abre la conexión y define 3 funciones que usan los demás PHP
│
├── Api/                  PHP que solo devuelven datos en JSON al JavaScript
│   ├── usuarios.php
│   ├── documentos.php
│   └── traslados.php
│
├── Html/
│   ├── Modulos.html      elegir módulo (Documentos / Traslados)
│   └── Administrativo/   todas las pantallas del panel
│
├── Js/
│   ├── comun.js          lo que usan todas las páginas
│   ├── usuarios.js       pantallas de usuarios
│   ├── documentos.js     contadores del inicio de documentos
│   ├── traslados.js      pantallas de traslados y ambulancias
│   └── traducciones.json diccionario español → inglés
│
├── Css/panel.css         la única hoja de estilos
└── Sql/hospital.sql      crea la base de datos
```

### La regla más importante: cada cosa en su lugar

- Los **`.html`** solo tienen HTML. No hay PHP ni JavaScript adentro.
- Los **`.js`** piden datos a la carpeta `Api/` con `fetch()` y arman las tablas.
- Los **`.php` de `Api/`** solo consultan la base y devuelven JSON. Nunca imprimen HTML.
- Los **`.php` de la raíz** (guardar, borrar, actualizar, estado, login) reciben un
  formulario, tocan la base y **redirigen** a una página. Tampoco imprimen HTML.

Así cada archivo hace una sola cosa y se puede leer de corrido.


## 3. Cómo funciona la navegación

1. `Index.html` → el usuario pone usuario y contraseña → `login.php`.
2. `login.php` busca la cuenta. Si la persona es **administrativo** la manda a `Modulos.html`;
   si solo es **chofer**, a `Chofer.html`, su pantalla propia (por ahora muestra la tabla vacía).
3. En `Modulos.html` elige Documentos o Traslados y entra al panel.
4. Dentro del panel hay un menú lateral (`<nav>`) con los enlaces del módulo.
   `marcarActivo()` en `comun.js` pinta en verde el enlace de la página actual
   comparando el `href` con el nombre del archivo abierto.
5. "Cerrar sesión" vuelve a `Index.html`.

Las rutas son relativas: desde `Html/Administrativo/` se sube dos niveles (`../../`)
para llegar a los PHP y a `Css/` y `Js/`.

Los archivos CSS y JS llevan `?v=28` al final. Es un truco para que el navegador no
use una versión vieja guardada en caché cuando cambiamos algo: si cambia el número,
lo vuelve a descargar.


## 4. Usuarios, roles e inicio de sesión

### Tablas

- **`persona`**: nombre, apellido, cédula, correo, dirección. **Una fila por persona**,
  la cédula es única.
- **`paciente`**: apunta a una persona.
- **`funcionario`**: apunta a una persona y dice `tipo_funcion` = `administrativo` o `chofer`.
- **`usuario`**: usuario y contraseña, apunta a una persona (una cuenta por persona).

### Una persona puede tener varios roles

Como los roles están en tablas aparte, la misma persona puede estar en `paciente`
y en `funcionario` a la vez, con una sola fila en `persona` y una sola cuenta.
Al registrar, `guardar.php` primero **busca la cédula**: si ya existe, reutiliza esa
persona y solo le agrega el rol; si no existe, la crea.

La base lo protege con dos reglas:

```sql
UNIQUE (id_persona)               -- en paciente: es paciente una sola vez
UNIQUE (id_persona, tipo_funcion) -- en funcionario: puede ser admin Y chofer, no admin dos veces
```

### Clave de acceso (token)

Para registrar un funcionario o chofer hay que escribir una clave que el hospital
entrega. Está guardada en la tabla `clave_acceso` (`Funcionario2026`). Los pacientes no
la necesitan porque no tienen cuenta.

### Contraseñas

Nunca se guardan en texto plano. Se guarda `SHA2(contraseña, 256)`, un resumen
irreversible. Al entrar se compara el resumen de lo que escribió con el guardado.
Por eso nadie, ni el administrador, puede ver la contraseña de otro.

### Sesión

`login.php` hace `session_start()` y guarda `$_SESSION['id_persona']`.
Hoy solo sirve para saber quién entró; cuando se reactive el panel del chofer,
`Api/traslados.php?tipo=mios` va a usar ese valor para devolver solo los traslados del
chofer que entró.

### Por qué las acciones van por POST

Eliminar, Iniciar y Finalizar son formularios `POST`, no enlaces. Chrome a veces
**precarga** los enlaces de una página sin que nadie haga clic; si Eliminar fuera un
enlace, se borrarían cosas solas. Los PHP de acción además rechazan cualquier GET:

```php
if ($_SERVER['REQUEST_METHOD'] != 'POST') { header("Location: Index.html"); exit; }
```


## 5. Cómo se guardan y se leen los datos

### Guardar (formulario → PHP → base → redirección)

```
registrar.html  ──POST──►  guardar.php?que=persona  ──INSERT──►  MySQL
                                     │
                                     └──header("Location: usuarios.html")
```

Un mismo archivo atiende varias cosas con `?que=`: `guardar.php?que=persona`,
`?que=ambulancia`. El registro público y el del panel usan la misma rama:
el formulario público solo agrega dos campos ocultos con a dónde volver.

### Leer (JavaScript → Api → JSON → tabla)

```
usuarios.js  ──fetch──►  Api/usuarios.php?tipo=lista&rol=chofer  ──SELECT──►  MySQL
     ▲                                  │
     └────────── JSON ◄─────────────────┘
```

El JavaScript recibe una lista y arma las filas `<tr>` con `innerHTML`.

### Las tres funciones de `conexion.php`

Como todos los PHP hacen `require_once 'conexion.php'`, ahí están las funciones
que se repetían:

```php
comoLista($resultado)        // pasa el resultado de una consulta a una lista
contar($tabla, $condicion)   // SELECT COUNT(*) con o sin WHERE
responder($datos)            // manda JSON al JavaScript y termina
```

### Normalización

- **1FN**: cada celda guarda un solo valor (nombre y apellido separados, etc.).
- **2FN**: los datos de la persona dependen solo de la cédula, no del rol; por eso
  están en `persona` y no repetidos en `paciente` y `funcionario`.
- **3FN**: nada depende de algo que no sea la clave. Si una persona se muda, se
  cambia una sola fila.

Las relaciones de muchos a muchos (`funcionario_traslado_maneja`, etc.) tienen
tabla propia con clave compuesta.


## 6. Funciones JavaScript importantes

### `comun.js` (todas las páginas)

| Función | Qué hace |
|---|---|
| `pedir(url)` | `fetch` + `json()` en una línea. |
| `botonAccion(accion, id, texto, clase, extra)` | Arma un formulario POST chiquito con un botón adentro. Es lo que hay detrás de cada Eliminar / Iniciar / Finalizar. |
| `fechaCorta("2026-09-12 10:00:00")` | Devuelve `12/09/2026 10:00`. |
| `aReloj(3725)` | Devuelve `01:02:05`. |
| `colorEstado(estado)` | Devuelve la clase CSS del color según el estado. |
| `filtrar(lista, texto, campos)` | Deja los elementos cuyo texto contiene lo buscado. Lo usan todos los buscadores. |
| `marcarActivo()` | Pinta el enlace del menú de la página actual. |
| `avisosDeLaDireccion()` | Si la URL trae `?guardado=si` o `?error=token`, muestra el mensaje en el `<p id="aviso">`. |
| `ponerOjitos()` | Agrega el botón 👁 a cada `input type="password"` y alterna entre `password` y `text`. |
| `prepararIdioma()` | Carga `traducciones.json`, traduce todos los textos, placeholders y titles, y con un `MutationObserver` traduce también lo que el JavaScript agrega después. Recuerda el idioma en `localStorage`. |

### Cómo sabe cada `.js` en qué página está

Al final de cada archivo hay un bloque "Arranque":

```js
if (document.getElementById("cuerpoTraslados")) { cargarLista(); }
if (document.getElementById("cuerpoMios"))      { cargarMios(); }
```

Cada pantalla tiene un `id` propio; si existe, se ejecuta la función de esa pantalla.
Así un solo archivo sirve para varias páginas sin código en el HTML.

### El temporizador del chofer (en pausa, está en `chofer.js.pausado`)

Cuando el chofer aprieta "Iniciar recorrido", `estado.php` guarda `inicio_real = NOW()`.
La tabla muestra `<span class="reloj" data-inicio="...">` y `correrRelojes()` calcula
cada segundo la diferencia con la hora actual. Al "Finalizar" se guarda `fin_real`,
y la duración sale de `TIMESTAMPDIFF(SECOND, inicio_real, fin_real)` en la consulta.
No se guarda el tiempo transcurrido: se guardan los dos instantes y se calcula.


## 7. Preguntas que pueden hacer y cómo responder

**¿Por qué no hay PHP dentro del HTML?**
Para separar responsabilidades. El HTML es la vista, el JavaScript pide datos, el PHP
los da. Cada archivo se entiende solo y se puede probar por separado.

**¿Por qué el CSS tiene variables (`--verde`)?**
Para cambiar un color en un solo lugar. Si el hospital cambia el verde, se toca una línea.

**¿Qué pasa si registro a la misma persona dos veces?**
La cédula es única en `persona`. El PHP la busca antes de insertar y reutiliza la fila.
Solo agrega el rol nuevo. Si repite el mismo rol, la base lo rechaza por la clave única.

**¿Y si un chofer también es paciente?**
Tiene una fila en `persona`, una en `paciente` y una en `funcionario`. Aparece en las
dos tablas de la pantalla Usuarios. Si lo eliminás de la lista de choferes, se borra
solo ese rol; la persona se borra recién cuando no le queda ningún rol.

**¿Cómo protegen las contraseñas?**
Con `SHA2(x, 256)`. Es un hash: no se puede volver atrás. En la base se ve un texto de
64 caracteres, nunca la contraseña.

**¿Por qué Eliminar es un formulario y no un enlace?**
Porque los navegadores precargan enlaces. Un GET no debe cambiar datos; los cambios
van siempre por POST. Además el PHP rechaza GET.

**¿Qué es el `?v=28`?**
Control de caché. El navegador guarda CSS y JS; al cambiar el número los vuelve a bajar.

**¿Por qué las tablas de relación tienen dos columnas como clave?**
Porque un traslado lo maneja un chofer y un chofer maneja muchos traslados: es muchos a
muchos, y la clave compuesta impide repetir el mismo par.

**¿Qué hace `MutationObserver`?**
Vigila el `<body>`. Cuando el JavaScript agrega filas nuevas a una tabla, las traduce
al inglés si el idioma está en inglés. Sin eso, solo se traduciría lo que estaba al cargar.

**¿Cómo se sabe qué chofer entró?**
`login.php` guarda su `id_persona` en `$_SESSION`. `Api/traslados.php?tipo=mios` lo lee
y filtra los traslados de ese funcionario.

**¿Por qué guardan `inicio_real` y `fin_real` en vez de la duración?**
Porque la duración se calcula y las fechas dan más información (cuándo fue). Guardar
algo calculable rompería la 3FN.

**¿Qué falta para que esté completo?**
El alta de traslados (está hecha, en pausa), la recuperación por mail (en pausa), las
encuestas y el QR que pide la letra, el mapa en vivo y proteger las páginas para que no
se puedan abrir por URL sin iniciar sesión.


## 8. Cómo correrlo

1. Copiar la carpeta `Web` a `C:\xampp\htdocs\`.
2. Encender Apache y MySQL en XAMPP.
3. En phpMyAdmin crear la base `hospital` e importar `Sql/hospital.sql`.
4. Abrir `http://localhost/Web/Index.html`.
5. Registrarse desde "Registrar" con la clave `Funcionario2026`.

Con Live Server **no funciona**, porque Live Server no ejecuta PHP.


## 9. Sobre la traducción

No hay texto en inglés en ningún archivo de código. **Todo** está en `Js/traducciones.json`,
un diccionario `"español": "inglés"` de unas 175 entradas. `prepararIdioma()` solo hace
el trabajo mecánico: recorre la página, y cada texto, `placeholder` o `title` que
encuentre en el diccionario lo cambia. Para volver a español usa el mismo diccionario
al revés; por eso ningún valor en inglés puede repetirse.

Si mañana se agrega una pantalla nueva, no hay que tocar JavaScript: se agregan sus
frases al JSON y listo.
