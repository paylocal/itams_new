const { URLSearchParams } = require('url');
const fetch = globalThis.fetch;
function parseCookies(setCookie) {
  if (!setCookie) return [];
  if (Array.isArray(setCookie)) return setCookie;
  return [setCookie];
}
function cookieString(cookies) {
  return cookies.map((c) => c.split(';')[0]).join('; ');
}
async function request(url, options = {}) {
  const res = await fetch(url, options);
  const cookies = parseCookies(res.headers.raw()['set-cookie']).filter(Boolean);
  return { res, cookies };
}
(async () => {
  const csrf = await request('http://localhost:3000/api/auth/csrf', { headers: { Accept: 'application/json' } });
  const csrfJson = await csrf.res.json();
  console.log('csrf token', csrfJson.csrfToken);
  console.log('csrf cookies', csrf.cookies);
  const login = await request('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieString(csrf.cookies),
    },
    body: new URLSearchParams({
      csrfToken: csrfJson.csrfToken,
      callbackUrl: 'http://localhost:3000/dashboard',
      email: 'admin@company.com',
      password: 'password123',
    }),
    redirect: 'manual',
  });
  console.log('login status', login.res.status);
  console.log('login location', login.res.headers.get('location'));
  console.log('login cookies', login.cookies);
  const allCookies = cookieString([...csrf.cookies, ...login.cookies]);
  const session = await request('http://localhost:3000/api/auth/session', {
    headers: { Cookie: allCookies, Accept: 'application/json' },
  });
  console.log('session status', session.res.status);
  console.log('session body', await session.res.text());
  const save = await request('http://localhost:3000/api/admin/translations', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: allCookies },
    body: JSON.stringify({ translations: [{ languageCode: 'en', key: 'admin.test', value: 'Test EN 2', category: 'admin' }] }),
  });
  console.log('save status', save.res.status);
  console.log('save body', await save.res.text());
})();
