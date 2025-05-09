
// 3. Print all registered routes - add this after route registration
console.log('\n=== REGISTERED ROUTES ===');
function printRoutes(stack, basePath = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .join(', ').toUpperCase();
      console.log(`${methods} ${basePath}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      // This is a router middleware
      const routerBasePath = basePath + (layer.regexp.source.replace(/\\\//g, '/').replace(/\^\//g, '').replace(/\\/g, '').replace(/\?.*$/, '') || '/');
      printRoutes(layer.handle.stack, routerBasePath);
    }
  });
}
printRoutes(app._router.stack);
console.log('======================\n');

// 4. Add a 404 handler at the very end
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// 5. Error handler
app.use((err, req, res, next) => {
  console.error(`[500] Server error for ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});