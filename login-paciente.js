function validarLoginPaciente(event) {
  event.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;

  if (usuario === "paciente" && clave === "1234") {
    window.location.href = "paciente.html";
  } else {
    document.getElementById("error").textContent = "Usuario o contraseña incorrectos.";
  }

  return false;
}
