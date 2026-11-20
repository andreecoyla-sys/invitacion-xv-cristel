const modal = document.getElementById('rsvpModal');
const btnAbrir = document.getElementById('btnAbrir');
const btnCerrar = document.getElementById('btnCerrar');
const formulario = document.getElementById('rsvpForm');
const mensajeBox = document.getElementById('successMsg');

// Abrir el cuestionario al hacer clic en "CONFIRMAR ASISTENCIA"
btnAbrir.addEventListener('click', () => {
  modal.classList.add('active');
});

// Cerrar el cuestionario con la "X"
btnCerrar.addEventListener('click', () => {
  modal.classList.remove('active');
});

// Cerrar si se hace clic fuera de la caja del formulario
modal.addEventListener('click', (evento) => {
  if (evento.target === modal) {
    modal.classList.remove('active');
  }
});

// Procesar envío del formulario
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById('nombreCompleto').value.trim();
  const colegio = document.getElementById('colegio').value.trim();

  mensajeBox.style.display = 'block';
  mensajeBox.innerHTML = `¡Gracias, <strong>${nombre}</strong> (${colegio})!<br>Tu pase VIP ha sido registrado.`;

  /* 
    OPCIONAL: Si deseas que se abra WhatsApp con los datos listos para enviarte,
    quita las "//" de las siguientes 3 líneas y reemplaza el número por el tuyo:
  */
  // const telefono = "51999999999";
  // const texto = encodeURIComponent(`¡Hola Cristel! Confirmo mi asistencia a tus XV.\n• Nombre: ${nombre}\n• Colegio: ${colegio}`);
  // window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank');
});