// 1. Credenciales de Supabase
const SUPABASE_URL = 'https://wvykyrjebtayldqsfltc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zhCD-gCE5bMkm3RvCUQ4Q_kv7wfjtl';
const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const modal = document.getElementById('rsvpModal');
const btnAbrir = document.getElementById('btnAbrir');
const btnCerrar = document.getElementById('btnCerrar');
const formulario = document.getElementById('rsvpForm');
const mensajeBox = document.getElementById('successMsg');
const radiosTipo = document.querySelectorAll('input[name="tipoInvitado"]');
const grupoColegio = document.getElementById('grupoNombreColegio');
const inputColegio = document.getElementById('nombreColegio');

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// ================= CRONÓMETRO (4 DE DICIEMBRE 2026 - 9:00 PM HORA PERÚ) =================
const fechaEvento = new Date('2026-12-04T21:00:00-05:00').getTime();

function actualizarCronometro() {
  const ahora = Date.now();
  const diferencia = fechaEvento - ahora;

  const elDays = document.getElementById('days');
  const elHours = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');

  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  if (diferencia <= 0) {
    elDays.textContent = '00';
    elHours.textContent = '00';
    elMinutes.textContent = '00';
    elSeconds.textContent = '00';
    return;
  }

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

  elDays.textContent = String(dias).padStart(2, '0');
  elHours.textContent = String(horas).padStart(2, '0');
  elMinutes.textContent = String(minutos).padStart(2, '0');
  elSeconds.textContent = String(segundos).padStart(2, '0');
}

actualizarCronometro();
setInterval(actualizarCronometro, 1000);

// Abrir y cerrar modal
btnAbrir.addEventListener('click', () => {
  mensajeBox.style.display = 'none';
  modal.classList.add('active');
});

btnCerrar.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// Mostrar u ocultar el campo para escribir el colegio según la opción elegida
radiosTipo.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'colegio' && radio.checked) {
      grupoColegio.style.display = 'block';
      inputColegio.required = true;
    } else if (radio.value === 'no_colegio' && radio.checked) {
      grupoColegio.style.display = 'none';
      inputColegio.required = false;
      inputColegio.value = '';
    }
  });
});

// Procesar envío del formulario
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById('nombreCompleto').value.trim();
  const opcionElegida = document.querySelector('input[name="tipoInvitado"]:checked').value;

  const colegioFinal = opcionElegida === 'colegio'
    ? inputColegio.value.trim()
    : 'No estoy en el colegio';

  const btnSubmit = formulario.querySelector('button[type="submit"]');

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'REGISTRANDO...';

  // Guardar en Supabase
  if (db) {
    const { error } = await db
      .from('invitados')
      .insert([{
        nombre_completo: nombre,
        colegio: colegioFinal
      }]);

    if (error) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';

      mensajeBox.style.display = 'block';
      mensajeBox.textContent = 'Hubo un problema al registrar. Intenta nuevamente.';

      console.error('Error Supabase:', error);
      return;
    }
  }

  btnSubmit.disabled = false;
  btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';

  mensajeBox.style.display = 'block';
  mensajeBox.innerHTML = `
    ¡Gracias, <strong>${escapeHTML(nombre)}</strong>!<br>
    Procedencia: <strong>${escapeHTML(colegioFinal)}</strong><br>
    <span style="color:#fff;">¡Tu asistencia ha sido confirmada!</span>
  `;

  formulario.reset();
  grupoColegio.style.display = 'block';
  inputColegio.required = true;
});