// 1. Credenciales de Supabase
const SUPABASE_URL = 'https://wvykyrjebtayldqsfltc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zhCD-gCE5bMkm-3RvCUQ4Q_kv7wfjtl';
const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const modal = document.getElementById('rsvpModal');
const btnAbrir = document.getElementById('btnAbrir');
const btnCerrar = document.getElementById('btnCerrar');
const formulario = document.getElementById('rsvpForm');
const mensajeBox = document.getElementById('successMsg');

const radiosTipo = document.querySelectorAll('input[name="tipoInvitado"]');
const grupoColegio = document.getElementById('grupoNombreColegio');
const inputColegio = document.getElementById('nombreColegio');

// Abrir y cerrar modal
btnAbrir.addEventListener('click', () => {
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
        colegio: colegioFinal, 
        codigo_vip: 'N/A' 
      }]);

    if (error) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';
      mensajeBox.style.display = 'block';
      mensajeBox.innerHTML = 'Hubo un problema al registrar. Intenta nuevamente.';
      console.error('Error Supabase:', error);
      return;
    }
  }

  btnSubmit.disabled = false;
  btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';

  mensajeBox.style.display = 'block';
  mensajeBox.innerHTML = `
    ¡Gracias, <strong>${nombre}</strong>!<br>
    Procedencia: <strong>${colegioFinal}</strong><br>
    <span style="color:#fff;">¡Tu asistencia ha sido confirmada!</span>
  `;

  formulario.reset();
  grupoColegio.style.display = 'block';
  inputColegio.required = true;
});