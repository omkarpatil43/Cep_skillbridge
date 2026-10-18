import fetch from 'node-fetch';

async function testHealth() {
  try {
    const res = await fetch('http://localhost:5000/api/health');
    console.log('Health status:', res.status);
    const data = await res.json();
    console.log('Health data:', data);
  } catch (err) {
    console.error('Health test failed:', err);
  }
}

testHealth();
