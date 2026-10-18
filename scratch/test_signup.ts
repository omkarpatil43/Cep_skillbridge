async function testSignup() {
  const formData = new FormData();
  formData.append('email', 'test.user@pict.edu');
  formData.append('rollNo', '24CS999');
  formData.append('name', 'Test Student');
  formData.append('branch', 'Computer Science & Engg');
  formData.append('password', 'Password123!');
  formData.append('confirmPassword', 'Password123!');

  // Dummy 1x1 png image
  const pngHeader = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const blob = new Blob([pngHeader], { type: 'image/png' });
  formData.append('idCard', blob, 'idcard.png');

  try {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      body: formData,
    });
    console.log('Signup status:', res.status);
    console.log('Signup Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('Signup Response:', text);
  } catch (err: any) {
    console.error('Signup request failed:', err);
  }
}

testSignup();
