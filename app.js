/* =========================================================
   Veterinaria Patitas - Módulo de Contacto y Consultas
   ========================================================= */

// Referencias a los elementos del DOM
const formulario = document.getElementById("form-consulta");
const campoNombre = document.getElementById("nombre");
const campoEmail = document.getElementById("email");
const campoServicio = document.getElementById("servicio");
const campoConsulta = document.getElementById("consulta");
const botonEnviar = document.getElementById("btn-enviar");
const cajaMensaje = document.getElementById("mensaje");
const listaConsultas = document.getElementById("lista-consultas");
const textoSinConsultas = document.getElementById("sin-consultas");

// Consultas enviadas durante la visita (enlace Cliente - Servicio)
const consultas = [];

// ---------- Registro de eventos (desacoplado del HTML) ----------
formulario.addEventListener("submit", enviarConsulta);
formulario.addEventListener("reset", limpiarFormulario);

// Al escribir en un campo marcado con error, se quita la marca
[campoNombre, campoEmail, campoServicio, campoConsulta].forEach(function (campo) {
  campo.addEventListener("input", function () {
    campo.classList.remove("campo-error");
  });
});

// ---------- Envío de la consulta ----------
async function enviarConsulta(evento) {
  evento.preventDefault(); // evita que la página se recargue

  const datos = {
    nombre: campoNombre.value.trim(),
    email: campoEmail.value.trim(),
    servicio: campoServicio.value,
    texto: campoConsulta.value.trim()
  };

  const errores = validar(datos);
  if (errores.length > 0) {
    mostrarMensaje("error", "Revisá los siguientes datos: " + errores.join(", ") + ".");
    return; // no se envía nada
  }

  // Estado de envío: se bloquea el botón para evitar envíos duplicados
  botonEnviar.disabled = true;
  botonEnviar.textContent = "Enviando...";
  formulario.setAttribute("aria-busy", "true");

  try {
    // Simulación del servidor con un archivo local
    const respuesta = await fetch("respuesta.json");

    if (!respuesta.ok) {
      throw new Error("el servidor respondió con el código " + respuesta.status);
    }

    const resultado = await respuesta.json();

    if (resultado.estado !== "ok" || typeof resultado.mensaje !== "string") {
      throw new Error("la respuesta no tiene el formato esperado");
    }

    // Se registra la consulta como enlace enriquecido (EORM)
    consultas.push({
      cliente: { nombre: datos.nombre, email: datos.email },
      servicio: datos.servicio,
      texto: datos.texto,
      fecha: new Date(),
      estado: "Recibida"
    });

    mostrarConsultas();
    formulario.reset();
    mostrarMensaje("exito", resultado.mensaje);
  } catch (error) {
    mostrarMensaje("error", "No pudimos enviar tu consulta (" + error.message + "). Intentá nuevamente.");
  } finally {
    botonEnviar.disabled = false;
    botonEnviar.textContent = "Enviar consulta";
    formulario.removeAttribute("aria-busy");
  }
}

// ---------- Validación ----------
function validar(datos) {
  const errores = [];

  if (datos.nombre === "") {
    errores.push("nombre");
    campoNombre.classList.add("campo-error");
  }

  if (datos.email === "") {
    errores.push("e-mail");
    campoEmail.classList.add("campo-error");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push("e-mail con formato válido");
    campoEmail.classList.add("campo-error");
  }

  if (datos.servicio === "") {
    errores.push("servicio");
    campoServicio.classList.add("campo-error");
  }

  if (datos.texto === "") {
    errores.push("consulta");
    campoConsulta.classList.add("campo-error");
  }

  return errores;
}

// ---------- Actualización del DOM ----------
function mostrarMensaje(tipo, texto) {
  cajaMensaje.className = "mensaje " + tipo;
  cajaMensaje.textContent = texto;
  cajaMensaje.hidden = false;
}

function mostrarConsultas() {
  const elementos = consultas.map(function (consulta) {
    const item = document.createElement("li");

    const titulo = document.createElement("strong");
    titulo.textContent = consulta.servicio;

    const detalle = document.createElement("span");
    detalle.textContent = consulta.cliente.nombre + " · " +
      consulta.fecha.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

    const texto = document.createElement("p");
    texto.textContent = consulta.texto;

    const estado = document.createElement("span");
    estado.className = "estado";
    estado.textContent = consulta.estado;

    item.append(titulo, estado, detalle, texto);
    return item;
  });

  // textContent y replaceChildren: los datos se insertan como texto, no como HTML
  listaConsultas.replaceChildren(...elementos);
  textoSinConsultas.hidden = consultas.length > 0;
}

function limpiarFormulario() {
  cajaMensaje.hidden = true;
  document.querySelectorAll(".campo-error").forEach(function (campo) {
    campo.classList.remove("campo-error");
  });
  campoNombre.focus();
}
