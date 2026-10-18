import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const key = process.env.SETUP_ACCESS_KEY;
const API_BASE = 'http://localhost:5000/api';

async function testE2E() {
  console.log('===================================================');
  console.log('🚀 Running Setup Wizard E2E Integration Test');
  console.log('===================================================');

  // Step 1: Check initial status
  console.log('\n[1/6] Checking GET /api/setup/status...');
  const res1 = await fetch(`${API_BASE}/setup/status`);
  const data1 = await res1.json();
  console.log('Status Response:', data1);
  if (data1.hasAdmin !== false) throw new Error('Expected hasAdmin to be false initially!');

  // Step 2: Verify Access Key
  console.log('\n[2/6] Verifying SETUP_ACCESS_KEY via POST /api/setup/verify-key...');
  const res2 = await fetch(`${API_BASE}/setup/verify-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessKey: key }),
  });
  const data2 = await res2.json();
  console.log('Verify-Key Response Success:', data2.success);
  if (!data2.success || !data2.setupToken) throw new Error('Failed to verify key or missing setupToken!');

  const setupToken = data2.setupToken;

  // Step 3: Create College Administrator Account
  console.log('\n[3/6] Creating Admin Account via POST /api/setup/create-admin...');
  const res3 = await fetch(`${API_BASE}/setup/create-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      setupToken,
      name: 'Dr. K. S. Verma (Dean Academics)',
      email: 'dean.verma@pict.edu',
      password: 'AdminPassword123!',
    }),
  });
  const data3 = await res3.json();
  console.log('Create-Admin Response Message:', data3.message);
  console.log('Created User Role:', data3.user?.role);
  if (!data3.success || data3.user?.role !== 'college_admin') {
    throw new Error('Failed to create college_admin account!');
  }

  // Step 4: Verify Status updated to hasAdmin: true
  console.log('\n[4/6] Re-checking GET /api/setup/status...');
  const res4 = await fetch(`${API_BASE}/setup/status`);
  const data4 = await res4.json();
  console.log('Status Response:', data4);
  if (data4.hasAdmin !== true) throw new Error('Expected hasAdmin to be true after setup!');

  // Step 5: Verify setup wizard is now permanently locked
  console.log('\n[5/6] Testing setup wizard lock via POST /api/setup/verify-key after creation...');
  const res5 = await fetch(`${API_BASE}/setup/verify-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessKey: key }),
  });
  const data5 = await res5.json();
  console.log('Locked Verify-Key Status Code:', res5.status);
  console.log('Locked Verify-Key Response Error:', data5.error);
  if (res5.status !== 403) throw new Error('Expected 403 Forbidden on locked setup wizard!');

  // Step 6: Test Login with created credentials
  console.log('\n[6/6] Logging in with newly created College Admin credentials...');
  const res6 = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dean.verma@pict.edu',
      rollNo: '',
      password: 'AdminPassword123!',
    }),
  });
  const data6 = await res6.json();
  console.log('Login Response User Role:', data6.user?.role);
  console.log('Login Auth Token Issued:', data6.token ? 'YES (Valid Signed Token)' : 'NO');

  if (!data6.success || data6.user?.role !== 'college_admin' || !data6.token) {
    throw new Error('Login with new college_admin credentials failed!');
  }

  console.log('\n===================================================');
  console.log('🎉 ALL 6 E2E SETUP STEPS PASSED SUCCESSFULLY!');
  console.log('===================================================');
}

testE2E().catch((err) => {
  console.error('\n❌ E2E Test Failed:', err);
  process.exit(1);
});
