const OAUTH_CONFIG = {
  clientId: '019e633b-08e8-73f2-9979-9135d7a1663c', // Замени на свой client_id из Laravel Passport
  authorizeUrl: 'http://localhost:8000/oauth/authorize',
  tokenUrl: 'http://localhost:8000/oauth/token',
  redirectUri: 'http://localhost:8000/auth/callback', // или где у тебя callback
};

// Начало PKCE flow - кнопка "Войти"
async function initiateLogin() {
  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);
  const state = generateState();
  
  // Сохраняем verifier в localStorage (или отправь на сервер в сессию)
  localStorage.setItem('code_verifier', verifier);
  localStorage.setItem('oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: 2,
    redirect_uri: 'http://localhost:8000/auth/callback',
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: state,
  });
  
  window.location.href = `http://localhost:8000/oauth/authorize?${params}`;
}
// Обработка callback после авторизации
async function handleCallback(code, state) {
  const savedState = sessionStorage.getItem('oauth_state');
  const verifier = sessionStorage.getItem('code_verifier');
  
  // Проверяем state (защита от CSRF)
  if (state !== savedState) {
    console.error('❌ State mismatch! Possible CSRF attack');
    return;
  }
  
  // Обмениваем code на токены
  const response = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: OAUTH_CONFIG.clientId,
      code: code,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      code_verifier: verifier,
    }),
  });
  
  const tokens = await response.json();
  
  // Сохраняем access_token
  localStorage.setItem('access_token', tokens.access_token);
  
  // Очищаем sessionStorage
  sessionStorage.removeItem('code_verifier');
  sessionStorage.removeItem('oauth_state');
  
  console.log('✅ Login successful!', tokens);
  return tokens;
}

// Делаем функции глобальными
window.initiateLogin = initiateLogin;
window.handleCallback = handleCallback;

console.log('✅ Auth module loaded');
