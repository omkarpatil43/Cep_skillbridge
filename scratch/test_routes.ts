import { authRouter } from '../server/routes/authRoutes.js';

console.log('Registered auth routes:');
authRouter.stack.forEach((r: any) => {
  if (r.route) {
    console.log(Object.keys(r.route.methods).join(',').toUpperCase(), r.route.path);
  }
});
