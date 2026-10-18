async function testChatApi() {
  try {
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello! Tell me about computer science.' }),
    });

    console.log('Chat API Status:', res.status);
    console.log('Chat API Content-Type:', res.headers.get('content-type'));
    const data = await res.json();
    console.log('Chat API Response:', data);
  } catch (err: any) {
    console.error('Chat API request failed:', err);
  }
}

testChatApi();
