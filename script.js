// 1. Credenciales de Supabase
const SUPABASE_URL = 'https://wvykyrjebtayldqsfltc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2uaNezvTsyNPlrmXk6gq6g_Q6ZFQ9zO'; 
const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const modal = document.getElementById('rsvpModal');
const btnAbrir = document.getElementById('btnAbrir');
const btnCerrar = document.getElementById('btnCerrar');
const formulario = document.getElementById('rsvpForm');
const mensajeBox = document.getElementById('successMsg');
const radiosTipo = document.querySelectorAll('input[name="tipoInvitado"]');
const grupoColegio = document.getElementById('grupoNombreColegio');
const inputColegio = document.getElementById('nombreColegio');

// Elementos de la ventana emergente de confirmación / alerta
const alertModal = document.getElementById('customAlertModal');
const alertBox = document.getElementById('customAlertBox');
const alertIcon = document.getElementById('customAlertIcon');
const alertTitle = document.getElementById('customAlertTitle');
const alertBody = document.getElementById('customAlertBody');
const btnCerrarAlerta = document.getElementById('btnCerrarAlerta');

// Configuración de cierre automático (500 invitados o miércoles 2 de diciembre medianoche)
const LIMITE_INVITADOS = 500;
const FECHA_CIERRE = new Date('2026-12-02T23:59:59-05:00').getTime();

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function mostrarVentanaEmergente(tipo, titulo, htmlMensaje, textoBoton) {
  alertBox.className = 'alert-box ' + tipo;
  alertIcon.textContent = tipo === 'exito' ? '✔' : '♠️';
  alertTitle.textContent = titulo;
  alertBody.innerHTML = htmlMensaje;
  btnCerrarAlerta.textContent = textoBoton;
  alertModal.classList.add('active');
}

btnCerrarAlerta.addEventListener('click', () => {
  alertModal.classList.remove('active');
});

alertModal.addEventListener('click', (e) => {
  if (e.target === alertModal) {
    alertModal.classList.remove('active');
  }
});

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

// ================= CIERRE AUTOMÁTICO DEL BOTÓN DE ASISTENCIA =================
function deshabilitarBotonAsistencia(motivo = 'REGISTRO CERRADO') {
  if (!btnAbrir) return;
  btnAbrir.disabled = true;
  btnAbrir.textContent = motivo;
  modal.classList.remove('active');
}

async function verificarEstadoRegistro() {
  if (Date.now() >= FECHA_CIERRE) {
    deshabilitarBotonAsistencia('REGISTRO CERRADO');
    return;
  }

  if (db) {
    const { count, error } = await db
      .from('invitados')
      .select('*', { count: 'exact', head: true });

    if (!error && count >= LIMITE_INVITADOS) {
      deshabilitarBotonAsistencia('AFORO COMPLETO');
      mostrarVentanaEmergente(
        'duplicado',
        'AFORO COMPLETO',
        'Lamentamos informarte que hemos alcanzado el límite máximo de <strong>500 invitados registrados</strong>.<br><br>Por capacidad del evento, ya no es posible registrar más ingresos.',
        'ENTENDIDO'
      );
    }
  }
}

verificarEstadoRegistro();
setInterval(() => {
  if (Date.now() >= FECHA_CIERRE) {
    deshabilitarBotonAsistencia('REGISTRO CERRADO');
  }
}, 10000);

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

  const nombre = document.getElementById('nombreCompleto').value.trim().replace(/\s+/g, ' ');
  const opcionElegida = document.querySelector('input[name="tipoInvitado"]:checked').value;

  const colegioFinal = opcionElegida === 'colegio'
    ? inputColegio.value.trim().replace(/\s+/g, ' ')
    : 'No estoy en el colegio';

  const btnSubmit = formulario.querySelector('button[type="submit"]');

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'VERIFICANDO...';

  // Guardar en Supabase
  if (db) {
    // 0. Verificar cierre por fecha o límite de 500 registrados antes de procesar
    if (Date.now() >= FECHA_CIERRE) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';
      deshabilitarBotonAsistencia('REGISTRO CERRADO');
      mostrarVentanaEmergente(
        'duplicado',
        'REGISTRO CERRADO',
        'El plazo para confirmar asistencia ha finalizado.<br><br>Agradecemos mucho tu interés en acompañarnos.',
        'ENTENDIDO'
      );
      return;
    }

    const { count: totalRegistrados, error: errorConteo } = await db
      .from('invitados')
      .select('*', { count: 'exact', head: true });

    if (!errorConteo && totalRegistrados >= LIMITE_INVITADOS) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';
      deshabilitarBotonAsistencia('AFORO COMPLETO');
      mostrarVentanaEmergente(
        'duplicado',
        'AFORO COMPLETO',
        'Lamentamos informarte que hemos alcanzado el límite máximo de <strong>500 invitados registrados</strong>.<br><br>Por capacidad del evento, ya no es posible registrar más ingresos.',
        'ENTENDIDO'
      );
      return;
    }

    // 1. Verificar si el nombre ya existe en la lista
    const { data: existentes, error: errorBusqueda } = await db
      .from('invitados')
      .select('nombre_completo')
      .ilike('nombre_completo', nombre);

    if (errorBusqueda) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';

      mostrarVentanaEmergente(
        'duplicado',
        'ERROR DE CONEXIÓN',
        'Hubo un problema al verificar la lista. Intenta nuevamente.',
        'ENTENDIDO'
      );
      console.error('Error búsqueda Supabase:', errorBusqueda);
      return;
    }

    // Si ya está registrado, mostrar ventana emergente y detener
    if (existentes && existentes.length > 0) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';

      mostrarVentanaEmergente(
        'duplicado',
        '¡YA ESTÁS EN LA LISTA!',
        `El nombre <strong>${escapeHTML(nombre)}</strong> ya se encuentra registrado en el sistema.<br><br>No es necesario volver a enviarlo.`,
        'ENTENDIDO'
      );
      return;
    }

    // 2. Si no existe, registrar
    btnSubmit.textContent = 'REGISTRANDO...';

    const { error } = await db
      .from('invitados')
      .insert([{
        nombre_completo: nombre,
        colegio: colegioFinal
      }]);

    if (error) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';

      mostrarVentanaEmergente(
        'duplicado',
        'ERROR AL REGISTRAR',
        'Hubo un problema al guardar tu registro. Intenta nuevamente.',
        'ENTENDIDO'
      );
      console.error('Error Supabase:', error);
      return;
    }

    // Si con este registro se alcanzó el cupo 500, deshabilitar el botón de inmediato
    if (!errorConteo && (totalRegistrados + 1) >= LIMITE_INVITADOS) {
      deshabilitarBotonAsistencia('AFORO COMPLETO');
    }
  }

  btnSubmit.disabled = false;
  btnSubmit.textContent = 'ENVIAR CONFIRMACIÓN';

  formulario.reset();
  grupoColegio.style.display = 'block';
  inputColegio.required = true;
  modal.classList.remove('active');

  mostrarVentanaEmergente(
    'exito',
    '¡REGISTRO CONFIRMADO!',
    `¡Gracias, <strong>${escapeHTML(nombre)}</strong>!<br>Tu nombre ya está en la lista VIP.<br><span class="alert-sub-text">Procedencia: ${escapeHTML(colegioFinal)}</span>`,
    '¡GENIAL, NOS VEMOS AHÍ!'
  );
});

// ================= CONTROL DE MÚSICA AMBIENTAL =================
const bgMusic = document.getElementById('bgMusic');
const btnMusic = document.getElementById('btnMusic');
let musicaIniciada = false;

if (bgMusic && btnMusic) {
  bgMusic.volume = 0.35;

  function toggleMusica() {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        btnMusic.textContent = '🎵';
        btnMusic.classList.add('playing');
        musicaIniciada = true;
      }).catch(() => {});
    } else {
      bgMusic.pause();
      btnMusic.textContent = '🔇';
      btnMusic.classList.remove('playing');
    }
  }

  btnMusic.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMusica();
  });

  document.addEventListener('click', () => {
    if (!musicaIniciada && bgMusic.paused) {
      bgMusic.play().then(() => {
        btnMusic.textContent = '🎵';
        btnMusic.classList.add('playing');
        musicaIniciada = true;
      }).catch(() => {});
    }
  }, { once: true });
}