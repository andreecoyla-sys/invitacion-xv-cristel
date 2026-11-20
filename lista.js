const SUPABASE_URL = 'https://wvykyrjebtayldqsfltc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zhCD-gCE5bMkm-3RvCUQ4Q_kv7wfjtl';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginScreen = document.getElementById('loginScreen');
const panelScreen = document.getElementById('panelScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

let listaGlobal = [];

// Verificar si ya hay una sesión activa al abrir la página
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

// Iniciar sesión con Supabase Auth
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  const btnLogin = document.getElementById('btnLogin');
  btnLogin.disabled = true;
  btnLogin.textContent = 'VERIFICANDO...';

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  const { error } = await db.auth.signInWithPassword({ email, password });

  btnLogin.disabled = false;
  btnLogin.textContent = 'INGRESAR AL PANEL';

  if (error) {
    loginError.style.display = 'block';
    return;
  }

  mostrarPanel();
});

// Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', async () => {
  await db.auth.signOut();
  listaGlobal = [];
  panelScreen.style.display = 'none';
  loginScreen.style.display = 'flex';
  loginForm.reset();
});

async function cargarInvitados() {
  const { data, error } = await db
    .from('invitados')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    document.getElementById('tablaInvitados').innerHTML = '<tr><td colspan="4">No autorizado o error de conexión.</td></tr>';
    return;
  }

  listaGlobal = data;
  actualizarContadores();
  renderizarTabla(listaGlobal);
}

function actualizarContadores() {
  document.getElementById('totalRegistrados').textContent = listaGlobal.length;
  document.getElementById('totalAsistieron').textContent = listaGlobal.filter(i => i.asistio).length;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function renderizarTabla(datos) {
  const tbody = document.getElementById('tablaInvitados');
  if (datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay registros todavía.</td></tr>';
    return;
  }

  tbody.innerHTML = datos.map(inv => `
    <tr>
      <td><strong>${escapeHTML(inv.nombre_completo)}</strong></td>
      <td>${escapeHTML(inv.colegio)}</td>
      <td>
        <button 
          class="btn-check ${inv.asistio ? 'btn-asistio' : 'btn-pendiente'}" 
          onclick="cambiarAsistencia(${inv.id}, ${!inv.asistio})"
        >
          ${inv.asistio ? '✓ ASISTIÓ' : 'MARCAR INGRESO'}
        </button>
      </td>
      <td>
        <button 
          class="btn-eliminar" 
          onclick="eliminarInvitado(${inv.id}, '${escapeHTML(inv.nombre_completo).replace(/&#39;/g, "\\'")}')"
        >
          ELIMINAR
        </button>
      </td>
    </tr>
  `).join('');
}

async function cambiarAsistencia(id, nuevoEstado) {
  const { error } = await db.from('invitados').update({ asistio: nuevoEstado }).eq('id', id);
  if (error) return;
  const item = listaGlobal.find(i => i.id === id);
  if (item) item.asistio = nuevoEstado;
  actualizarContadores();
  filtrar();
}

async function eliminarInvitado(id, nombre) {
  const confirmar = confirm(`¿Seguro que deseas eliminar a "${nombre}" de la lista?`);
  if (!confirmar) return;

  const { error } = await db.from('invitados').delete().eq('id', id);
  if (error) {
    alert('No se pudo eliminar el registro.');
    return;
  }

  listaGlobal = listaGlobal.filter(i => i.id !== id);
  actualizarContadores();
  filtrar();
}

function filtrar() {
  const texto = document.getElementById('buscador').value.toLowerCase();
  const filtrados = listaGlobal.filter(i =>
    i.nombre_completo.toLowerCase().includes(texto) ||
    i.colegio.toLowerCase().includes(texto)
  );
  renderizarTabla(filtrados);
}

document.getElementById('buscador').addEventListener('input', filtrar);
verificarSesion();