const SUPABASE_URL = 'https://wvykyrjebtayldqsfltc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2uaNezvTsyNPlrmXk6gq6g_Q6ZFQ9zO';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginScreen = document.getElementById('loginScreen');
const panelScreen = document.getElementById('panelScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const togglePass = document.getElementById('togglePass');
const adminPassword = document.getElementById('adminPassword');

// Elementos del modal (ahora sirve para Agregar y Editar)
const modalAgregar = document.getElementById('modalAgregar');
const modalTitle = modalAgregar.querySelector('.modal-title');
const modalSub = modalAgregar.querySelector('.modal-sub');
const btnAbrirAgregar = document.getElementById('btnAbrirAgregar');
const btnCerrarAgregar = document.getElementById('btnCerrarAgregar');
const formAgregarInvitado = document.getElementById('formAgregarInvitado');
const radiosNuevoTipo = document.querySelectorAll('input[name="nuevoTipo"]');
const grupoNuevoColegio = document.getElementById('grupoNuevoColegio');
const inputNuevoColegio = document.getElementById('nuevoColegio');
const btnGuardarInvitado = document.getElementById('btnGuardarInvitado');

const SVG_EYE_OPEN = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`;

const SVG_EYE_CLOSED = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>`;

const SVG_PENCIL = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>`;

let listaGlobal = [];
let idEditando = null; // null = agregando nuevo, número = editando existente

// Mostrar u ocultar contraseña con ícono SVG
togglePass.addEventListener('click', () => {
  const esOculta = adminPassword.type === 'password';
  adminPassword.type = esOculta ? 'text' : 'password';
  togglePass.innerHTML = esOculta ? SVG_EYE_CLOSED : SVG_EYE_OPEN;
});

// ================= MODAL AGREGAR / EDITAR INVITADO =================
btnAbrirAgregar.addEventListener('click', () => {
  idEditando = null;
  modalTitle.textContent = 'Agregar Invitado';
  modalSub.textContent = 'REGISTRO MANUAL • PANEL VIP';
  btnGuardarInvitado.textContent = 'GUARDAR EN LISTA';

  formAgregarInvitado.reset();
  grupoNuevoColegio.style.display = 'block';
  inputNuevoColegio.required = true;
  modalAgregar.classList.add('active');
});

function abrirModalEditar(id) {
  const invitado = listaGlobal.find(i => i.id === id);
  if (!invitado) return;

  idEditando = id;
  modalTitle.textContent = 'Editar Invitado';
  modalSub.textContent = 'MODIFICAR DATOS • PANEL VIP';
  btnGuardarInvitado.textContent = 'GUARDAR CAMBIOS';

  document.getElementById('nuevoNombre').value = invitado.nombre_completo || '';

  const noEstaEnColegio = normalizarTexto(invitado.colegio) === 'no estoy en el colegio';

  if (noEstaEnColegio) {
    document.querySelector('input[name="nuevoTipo"][value="no_colegio"]').checked = true;
    grupoNuevoColegio.style.display = 'none';
    inputNuevoColegio.required = false;
    inputNuevoColegio.value = '';
  } else {
    document.querySelector('input[name="nuevoTipo"][value="colegio"]').checked = true;
    grupoNuevoColegio.style.display = 'block';
    inputNuevoColegio.required = true;
    inputNuevoColegio.value = invitado.colegio || '';
  }

  modalAgregar.classList.add('active');
}

btnCerrarAgregar.addEventListener('click', () => {
  modalAgregar.classList.remove('active');
  idEditando = null;
});

modalAgregar.addEventListener('click', (e) => {
  if (e.target === modalAgregar) {
    modalAgregar.classList.remove('active');
    idEditando = null;
  }
});

radiosNuevoTipo.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'colegio' && radio.checked) {
      grupoNuevoColegio.style.display = 'block';
      inputNuevoColegio.required = true;
    } else if (radio.value === 'no_colegio' && radio.checked) {
      grupoNuevoColegio.style.display = 'none';
      inputNuevoColegio.required = false;
      inputNuevoColegio.value = '';
    }
  });
});

formAgregarInvitado.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nuevoNombre').value.trim();
  const tipo = document.querySelector('input[name="nuevoTipo"]:checked').value;
  const colegioFinal = tipo === 'colegio'
    ? inputNuevoColegio.value.trim()
    : 'No estoy en el colegio';

  btnGuardarInvitado.disabled = true;
  btnGuardarInvitado.textContent = 'GUARDANDO...';

  if (idEditando !== null) {
    // MODO EDICIÓN
    const { error } = await db
      .from('invitados')
      .update({
        nombre_completo: nombre,
        colegio: colegioFinal
      })
      .eq('id', idEditando);

    btnGuardarInvitado.disabled = false;
    btnGuardarInvitado.textContent = 'GUARDAR CAMBIOS';

    if (error) {
      alert('Error al actualizar los datos en Supabase.');
      console.error(error);
      return;
    }

    const item = listaGlobal.find(i => i.id === idEditando);
    if (item) {
      item.nombre_completo = nombre;
      item.colegio = colegioFinal;
    }

    filtrar();
    idEditando = null;
    modalAgregar.classList.remove('active');
    return;
  }

  // MODO NUEVO INVITADO
  const { data, error } = await db
    .from('invitados')
    .insert([{
      nombre_completo: nombre,
      colegio: colegioFinal,
      asistio: false
    }])
    .select();

  btnGuardarInvitado.disabled = false;
  btnGuardarInvitado.textContent = 'GUARDAR EN LISTA';

  if (error) {
    alert('Error al guardar el invitado en Supabase.');
    console.error(error);
    return;
  }

  if (data && data.length > 0) {
    listaGlobal.unshift(data[0]);
    actualizarContadores();
    filtrar();
  } else {
    cargarInvitados();
  }

  modalAgregar.classList.remove('active');
});

// ================= SESIÓN Y LISTA =================
async function verificarSesion() {
  const { data: { session } } = await db.auth.getSession();

  if (session) {
    mostrarPanel();
  } else {
    loginScreen.style.display = 'flex';
    panelScreen.style.display = 'none';
  }
}

function mostrarPanel() {
  loginScreen.style.display = 'none';
  panelScreen.style.display = 'block';
  cargarInvitados();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  loginError.style.display = 'none';

  const btnLogin = document.getElementById('btnLogin');

  btnLogin.disabled = true;
  btnLogin.textContent = 'VERIFICANDO...';

  const email = document.getElementById('adminEmail').value.trim();
  const password = adminPassword.value;

  const { error } = await db.auth.signInWithPassword({ email, password });

  btnLogin.disabled = false;
  btnLogin.textContent = 'INGRESAR AL PANEL';

  if (error) {
    loginError.style.display = 'block';
    return;
  }

  mostrarPanel();
});

document.getElementById('btnLogout').addEventListener('click', async () => {
  await db.auth.signOut();

  listaGlobal = [];
  panelScreen.style.display = 'none';
  loginScreen.style.display = 'flex';
  loginForm.reset();
  adminPassword.type = 'password';
  togglePass.innerHTML = SVG_EYE_OPEN;
});

async function cargarInvitados() {
  const { data, error } = await db
    .from('invitados')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    document.getElementById('tablaInvitados').innerHTML =
      '<tr><td colspan="4">No autorizado o error de conexión.</td></tr>';
    return;
  }

  listaGlobal = data || [];
  actualizarContadores();
  filtrar();
}

function actualizarContadores() {
  const total = listaGlobal.length;
  const asistieron = listaGlobal.filter(i => Boolean(i.asistio)).length;
  const faltan = Math.max(0, total - asistieron);

  const elTotal = document.getElementById('totalRegistrados');
  const elAsistieron = document.getElementById('totalAsistieron');
  const elFaltan = document.getElementById('totalFaltan');

  if (elTotal) elTotal.textContent = total;
  if (elAsistieron) elAsistieron.textContent = asistieron;
  if (elFaltan) elFaltan.textContent = faltan;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function renderizarTabla(datos) {
  const tbody = document.getElementById('tablaInvitados');

  if (!datos || datos.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center;">No hay registros todavía.</td></tr>';
    return;
  }

  tbody.innerHTML = datos.map(inv => {
    const asistio = Boolean(inv.asistio);
    const nombreSeguro = escapeHTML(inv.nombre_completo);
    const colegioSeguro = escapeHTML(inv.colegio);
    const nombreJs = nombreSeguro.replace(/&#39;/g, "\\'");

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <button
              type="button"
              onclick="abrirModalEditar(${inv.id})"
              title="Editar invitado"
              style="background:none; border:none; color:#d4af73; cursor:pointer; padding:2px; display:inline-flex; align-items:center;"
            >
              ${SVG_PENCIL}
            </button>
            <strong>${nombreSeguro}</strong>
          </div>
        </td>
        <td>${colegioSeguro}</td>
        <td>
          <button
            type="button"
            class="btn-check ${asistio ? 'btn-asistio' : 'btn-pendiente'}"
            onclick="cambiarAsistencia(${inv.id}, ${!asistio})"
          >
            ${asistio ? '✓ ASISTIÓ' : 'MARCAR INGRESO'}
          </button>
        </td>
        <td>
          <button
            type="button"
            class="btn-eliminar"
            onclick="eliminarInvitado(${inv.id}, '${nombreJs}')"
          >
            ELIMINAR
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function cambiarAsistencia(id, nuevoEstado) {
  const { error } = await db
    .from('invitados')
    .update({ asistio: nuevoEstado })
    .eq('id', id);

  if (error) {
    alert('No se pudo actualizar el estado de asistencia.');
    console.error(error);
    return;
  }

  const item = listaGlobal.find(i => i.id === id);
  if (item) {
    item.asistio = nuevoEstado;
  }

  actualizarContadores();
  filtrar();
}

async function eliminarInvitado(id, nombre) {
  const confirmar = confirm(`¿Seguro que deseas eliminar a "${nombre}" de la lista?`);

  if (!confirmar) return;

  const { error } = await db
    .from('invitados')
    .delete()
    .eq('id', id);

  if (error) {
    alert('No se pudo eliminar el registro.');
    console.error(error);
    return;
  }

  listaGlobal = listaGlobal.filter(i => i.id !== id);
  actualizarContadores();
  filtrar();
}

function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function filtrar() {
  const texto = normalizarTexto(document.getElementById('buscador').value);

  if (!texto) {
    renderizarTabla(listaGlobal);
    return;
  }

  const filtrados = listaGlobal.filter(i =>
    normalizarTexto(i.nombre_completo).includes(texto) ||
    normalizarTexto(i.colegio).includes(texto)
  );

  renderizarTabla(filtrados);
}

document.getElementById('buscador').addEventListener('input', filtrar);

verificarSesion();