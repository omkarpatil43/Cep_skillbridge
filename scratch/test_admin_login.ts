async function testAdminLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@pict.edu',
        rollNo: '',
        password: 'AdminPassword123!',
      }),
    });

    console.log('Login Status:', res.status);
    const data = await res.json();
    console.log('Login Response:', data);
  } catch (err: any) {
    console.error('Login failed:', err);
  }
}

testAdminLogin();
