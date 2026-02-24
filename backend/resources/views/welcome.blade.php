<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Login / Logout</title>
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; }
    form { max-width: 420px; margin-bottom: 1rem; }
    label { display:block; margin-top: .5rem; }
    input { width:100%; padding:.5rem; margin-top:.25rem; box-sizing:border-box; }
    button { margin-top: .75rem; padding:.5rem 1rem; }
    #status { margin-top:1rem; color:#333; }
  </style>
</head>
<body>
  <h1>Autenticación simple</h1>

  <!-- Formulario de login -->
  <form id="loginForm" onsubmit="return false;">
    <label for="email">Email</label>
    <input id="email" type="email" required />

    <label for="password">Password</label>
    <input id="password" type="password" required />

    <button id="loginBtn" type="submit">Iniciar sesión</button>
  </form>

  <!-- Área de usuario autenticado -->
  <div id="authArea" style="display:none;">
    <p>Conectado como <strong id="userEmail"></strong></p>
    <button id="logoutBtn">Cerrar sesión</button>
    <button id="checkHeadersBtn">Comprobar cabeceras</button>
  </div>

  <div id="status"></div>

  <script>
    const apiBase = '/api'; // usa el prefijo tal como en routes/api.php

    function setStatus(text, isError = false) {
      const s = document.getElementById('status');
      s.textContent = text;
      s.style.color = isError ? 'crimson' : '#333';
    }

    function showAuthArea(token, email) {
      document.getElementById('authArea').style.display = token ? 'block' : 'none';
      document.getElementById('loginForm').style.display = token ? 'none' : 'block';
      document.getElementById('userEmail').textContent = email || '';
    }

    // Inicializar desde localStorage
    const savedToken = localStorage.getItem('access_token');
    const savedEmail = localStorage.getItem('user_email');
    showAuthArea(savedToken, savedEmail);

    // Login: POST a /api/login
    document.getElementById('loginBtn').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      if (!email || !password) { setStatus('Rellena email y password.', true); return; }

      setStatus('Iniciando sesión...');
      try {
        const res = await fetch(`${apiBase}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json().catch(()=>({}));
        if (!res.ok) {
          const msg = data.message || data.error || 'Error en login';
          setStatus(msg, true);
          return;
        }

        // Guarda token y email
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_email', email);
        showAuthArea(data.access_token, email);
        setStatus('Sesión iniciada correctamente.');
      } catch (err) {
        setStatus('Error de red al intentar iniciar sesión.', true);
        console.error(err);
      }
    });

    // Logout: POST a /api/logout con Authorization header
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { setStatus('No hay token para cerrar sesión.', true); showAuthArea(null); return; }

      setStatus('Cerrando sesión...');
      try {
        const res = await fetch(`${apiBase}/logout`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_email');
          showAuthArea(null);
          setStatus('Sesión cerrada.');
        } else {
          const data = await res.json().catch(()=>({}));
          const msg = data.message || data.error || 'Error al cerrar sesión';
          setStatus(msg, true);
        }
      } catch (err) {
        setStatus('Error de red al intentar cerrar sesión.', true);
        console.error(err);
      }
    });

    // Botón de depuración: llama a /api/check-headers para ver qué cabeceras llegan al backend
    document.getElementById('checkHeadersBtn').addEventListener('click', async () => {
      const token = localStorage.getItem('access_token') || '';
      setStatus('Comprobando cabeceras...');
      try {
        const res = await fetch(`${apiBase}/check-headers`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        setStatus('Respuesta check-headers: ' + JSON.stringify(data));
      } catch (err) {
        setStatus('Error al comprobar cabeceras.', true);
        console.error(err);
      }
    });
  </script>
</body>
</html>
