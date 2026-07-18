(async()=>{
  try {
    const fetch = globalThis.fetch;
    const getCookies = (header) => {
      if (!header) return [];
      return header
        .split(/,(?=[^ ]*?(?:next-auth\.session-token|next-auth\.csrf-token|next-auth\.callback-url)=)/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.split(';')[0]);
    };

    const csrf = await fetch('http://localhost:3000/api/auth/csrf', { headers: { Accept: 'application/json' } });
    const csrfJson = await csrf.json();
    console.log('csrf', csrfJson.csrfToken);
    const csrfCookies = getCookies(csrf.headers.get('set-cookie'));
    console.log('csrfCookies', csrfCookies);

    const login = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': csrfCookies.join('; ') },
      body: new URLSearchParams({ csrfToken: csrfJson.csrfToken, callbackUrl: 'http://localhost:3000/dashboard', email: 'admin@company.com', password: 'password123' }),
      redirect: 'manual',
    });
    console.log('login status', login.status, 'loc', login.headers.get('location'));
    const loginCookies = getCookies(login.headers.get('set-cookie'));
    console.log('loginCookies', loginCookies);

    const cookie = csrfCookies.concat(loginCookies).join('; ');
    console.log('all cookie', cookie);

    const session = await fetch('http://localhost:3000/api/auth/session', { headers: { Cookie: cookie, Accept: 'application/json' } });
    console.log('session status', session.status);
    console.log(await session.text());

    const save = await fetch('http://localhost:3000/api/admin/translations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ translations: [{ languageCode: 'en', key: 'admin.test', value: 'Test EN 2', category: 'admin' }] }),
    });
    console.log('save status', save.status);
    console.log(await save.text());
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  }
})();
