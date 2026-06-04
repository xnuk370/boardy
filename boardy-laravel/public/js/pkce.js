function generateVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Генерация Code Challenge (SHA-256 хеш от verifier)
async function generateChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Генерация State (защита от CSRF)
function generateState() {
  return btoa(Math.random().toString(36)).substring(2, 15);
}

// Делаем функции глобальными (доступны в консоли браузера)
window.generateVerifier = generateVerifier;
window.generateChallenge = generateChallenge;
window.generateState = generateState;

console.log('✅ PKCE utilities loaded');
