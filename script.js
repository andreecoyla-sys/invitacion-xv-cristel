// 1. Credenciales de Supabase
const SUPABASE_URL = 'https://wvykyrjebtayldqsfitc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2eWt5cmplYnRheWxkcXNmbHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxNDE0NDgsImV4cCI6MjExMDcxNzQ0OH0.1ady6AecELJpTO_CILi2m82YbkxKUDuQTix4Ic7RrqQ';
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

// Generar código único para el pase VIP (ej. XV-842K)
function generarCodigoVIP() {
  const num = Math.floor(100 + Math.random() * 900);
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letra = letras[Math.floor(Math.random() * letras.length)];
  return `XV-${num}${letra}`;
}

// Procesar envío del formulario
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById('nombreCompleto').value.trim();
  const opcionElegida = document.querySelector('input[name="tipoInvitado"]:checked').value;
  const colegioFinal = opcionElegida === 'colegio' 
    ? inputColegio.value.trim() 
    : 'No estoy en el colegio';
  const codigoVip = generarCodigoVIP();

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
        codigo_vip: codigoVip 
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
    Tu código VIP es: <strong style="font-size:15px; color:#fff;">${codigoVip}</strong>
  `;

  formulario.reset();
  grupoColegio.style.display = 'block';
  inputColegio.required = true;
});