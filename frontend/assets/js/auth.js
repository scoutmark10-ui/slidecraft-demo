const API_URL = 'http://localhost:3000/api';

function setToken(token) {
  localStorage.setItem('slidecraft_token', token);
}

function getToken() {
  return localStorage.getItem('slidecraft_token');
}

function removeToken() {
  localStorage.removeItem('slidecraft_token');
  localStorage.removeItem('slidecraft_user');
}

async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login falhou');
  }
  setToken(data.token);
  localStorage.setItem('slidecraft_user', JSON.stringify(data.user));

  if (data.user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'request.html';
  }
}

async function register(nome, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registo falhou');
  }
  setToken(data.token);
  localStorage.setItem('slidecraft_user', JSON.stringify(data.user));
  window.location.href = 'request.html';
}

function logout() {
  removeToken();
  window.location.href = 'index.html';
}

function isLoggedIn() {
  return !!getToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function isAdmin() {
  const user = JSON.parse(localStorage.getItem('slidecraft_user') || '{}');
  return user.role === 'admin';
}