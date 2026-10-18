import fetch from 'node-fetch';

async function testProxy(port: number) {
  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    console.log(`Port ${port} /api/health status:`, res.status);
    const contentType = res.headers.get('content-type');
    console.log(`Port ${port} content-type:`, contentType);
    const text = await res.text();
    console.log(`Port ${port} response body snippet:`, text.substring(0, 150));
  } catch (err: any) {
    console.error(`Port ${port} failed:`, err.message);
  }
}

async function main() {
  console.log('Testing port 5000:');
  await testProxy(5000);
  console.log('\nTesting port 5173:');
  await testProxy(5173);
  console.log('\nTesting port 5174:');
  await testProxy(5174);
}

main();
