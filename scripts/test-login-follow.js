(async()=>{
  try {
    const fetch = globalThis.fetch;
    const getCookies = (header) => {
      if (!header) return [];
      return header
        .split(/,(?=[^ ]*?(?:next-auth\.session-token|next-auth\.csrf-token|next-auth\.callback-url|__Secure-next-auth\.session-token)=)/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.split(';')[0]);
    };

    const joinCookies = (arr) => (arr && arr.length ? arr.join('; ') : '');

    const csrfResp = await fetch('http://localhost:3000/api/auth/csrf', { headers: { Accept: 'application/json' } });
    const csrfJson = await csrfResp.json();
    const csrfCookies = getCookies(csrfResp.headers.get('set-cookie'));
    console.log('csrfToken', csrfJson.csrfToken);
    console.log('csrfCookies', csrfCookies);

    const loginResp = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: joinCookies(csrfCookies) },
      body: new URLSearchParams({ csrfToken: csrfJson.csrfToken, callbackUrl: 'http://localhost:3000/dashboard', email: 'admin@company.com', password: 'password123' }),
      redirect: 'manual',
    });
    console.log('login resp status', loginResp.status);
    const loginSet = loginResp.headers.get('set-cookie');
    console.log('login set-cookie', loginSet);
    let cookies = [...csrfCookies, ...getCookies(loginSet)];
    // Ensure session token is captured even if parsing fails
    try {
      const m = loginSet && loginSet.match(/(?:^|,\s*)(?:__Secure-)?next-auth\.session-token=([^;]+)/);
      if (m) {
        cookies.push((m[0] || '').split('=')[0] + '=' + m[1]);
      }
    } catch (e) {}

    if (loginResp.status === 302) {
      const loc = loginResp.headers.get('location');
      console.log('redirect to', loc);
      // follow redirect once
      const redirected = await fetch(loc, { headers: { Cookie: joinCookies(cookies) }, redirect: 'manual' });
      console.log('redirect status', redirected.status);
      const set2 = redirected.headers.get('set-cookie');
      console.log('redirect set-cookie', set2);
      cookies = cookies.concat(getCookies(set2));

      // try session
      const cookieHeader = joinCookies(cookies);
      console.log('cookies being sent', cookieHeader);
      const session = await fetch('http://localhost:3000/api/auth/session', { headers: { Cookie: cookieHeader, Accept: 'application/json' } });
      console.log('session status', session.status);
      const body = await session.text();
      console.log('session body', body);
    } else {
      console.log('no redirect, response text:', await loginResp.text());
    }

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
