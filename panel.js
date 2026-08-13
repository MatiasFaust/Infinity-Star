function mostrarModulo(nombre) {
  document.getElementById("selector-modulos").style.display = nombre === "selector" ? "block" : "none";
  document.getElementById("modulo-tras").style.display = nombre === "tras" ? "flex" : "none";
  document.getElementById("modulo-doc").style.display = nombre === "doc" ? "flex" : "none";
}
