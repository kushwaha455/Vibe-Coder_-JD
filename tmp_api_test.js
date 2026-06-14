const urls = [
  { url: 'http://localhost:3001/api/employees', options: { method: 'GET' } },
  { url: 'http://localhost:3001/api/auth', options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@example.com', password: 'password' }) } },
  { url: 'http://localhost:3001/api/auth/register', options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'test', email: 'test@example.com', password: 'password' }) } },
];
(async () => {
  for (const { url, options } of urls) {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      console.log('URL:', url);
      console.log('STATUS:', res.status);
      console.log('CONTENT-TYPE:', res.headers.get('content-type'));
      console.log('BODY:', text.slice(0, 1600));
      console.log('----');
    } catch (error) {
      console.error('ERROR calling', url, error);
    }
  }
})();
