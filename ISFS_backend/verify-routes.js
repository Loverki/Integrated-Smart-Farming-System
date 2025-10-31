/**
 * Quick script to verify sensor routes are properly exported
 */

import sensorModule from './routes/sensorRoutes.js';
import * as sensorModuleNamed from './routes/sensorRoutes.js';

console.log('Checking sensor routes exports...\n');
console.log('Module keys:', Object.keys(sensorModule));
console.log('Named exports:', Object.keys(sensorModuleNamed));
console.log('');

if (sensorModule.default) {
  console.log('✅ Default router (farmer routes) exported');
  console.log('   Routes:', sensorModule.default.stack?.length || 0, 'routes registered');
} else {
  console.log('❌ Default router NOT exported');
}

if (sensorModuleNamed.adminRouter || sensorModule.adminRouter) {
  const adminRouter = sensorModuleNamed.adminRouter || sensorModule.adminRouter;
  console.log('✅ Admin router exported');
  console.log('   Routes:', adminRouter.stack?.length || 0, 'routes registered');
  console.log('   Route paths:');
  if (adminRouter.stack && adminRouter.stack.length > 0) {
    adminRouter.stack.forEach((route) => {
      if (route.route) {
        const methods = Object.keys(route.route.methods).join(', ').toUpperCase();
        console.log(`   - ${methods} ${route.route.path}`);
      }
    });
  } else {
    console.log('   (No routes registered yet - might need app to be initialized)');
  }
} else {
  console.log('❌ Admin router NOT exported');
  console.log('   Available exports:', Object.keys(sensorModule));
}

console.log('\n✅ Route verification complete!');

