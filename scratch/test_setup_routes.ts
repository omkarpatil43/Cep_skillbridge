import http from 'http';

function testEndpoint(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing GET /api/setup/status...');
  const res = await testEndpoint('/api/setup/status');
  console.log('GET /api/setup/status response:', res);
}

run().catch(console.error);
