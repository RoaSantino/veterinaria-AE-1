// 1. Buscamos los elementos del HTML
const formulario = document.getElementById("formContacto");
const mensaje = document.getElementById("mensaje");

// 2. Mostrar un mensaje en pantalla (éxito o error)
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo; // "exito" o "error"
  mensaje.style.display = "block";
}

// 3. Enviar los datos con fetch a un archivo .json local
async function enviarConsulta(datos) {
  const respuesta = await fetch("respuesta.json");
  if (!respuesta.ok) {
    throw new Error("No se pudo conectar con el servidor");
  }
  const resultado = await respuesta.json();
  return resultado;
}

// 4. Evento submit (desacoplado: sin onsubmit en el HTML)
formulario.addEventListener("submit", async function (e) {
  e.preventDefault(); // evita que se recargue la página

  // Leemos los campos y sacamos espacios con trim()
  const datos = {
    nombre: document.getElementById("nombre").value.trim(),
    email: document.getElementById("email").value.trim(),
    servicio: document.getElementById("servicio").value,
    consulta: document.getElementById("consulta").value.trim()
  };

  // Validación: campos vacíos
  if (datos.nombre === "" || datos.email === "" || datos.consulta === "") {
    mostrarMensaje("Por favor, completá todos los campos.", "error");
    return;
  }

  // Llamada asíncrona con manejo de errores
  try {
    const resultado = await enviarConsulta(datos);
    mostrarMensaje(resultado.mensaje, "exito");
    formulario.reset();
  } catch (error) {
    mostrarMensaje("Ocurrió un error: " + error.message, "error");
  }
});
