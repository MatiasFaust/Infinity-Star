function validarLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;

  if (usuario === "admin" && clave === "1234") {
    const destino = new URLSearchParams(window.location.search).get("next") || "Opciones.html";
    window.location.href = destino;
  } else {
    document.getElementById("error").textContent = "Usuario o contraseña incorrectos.";
  }

  return false;
}
