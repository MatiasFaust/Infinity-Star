const botones = document.querySelectorAll(".opcion");

botones.forEach(function(boton) {

    boton.addEventListener("click", function() {

        console.log("Botón presionado");

    });

});


const volver = document.querySelector(".volver");

volver.addEventListener("click", function() {

    console.log("Volver presionado");

});
