import bcrypt from 'bcrypt';

async function main() {
  const p1 = await bcrypt.hash('Password123!', 10);
  const p2 = await bcrypt.hash('AdminPassword123!', 10);
  console.log('HASH_USER:', p1);
  console.log('HASH_ADMIN:', p2);
}

main();
