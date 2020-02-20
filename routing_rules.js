const defaultRoute =
  process.env.DEFAULT_ROUTE || "http://httpbin.org";
  // process.env.DEFAULT_ROUTE || "http://localhost:8081";
  

module.exports = {
  router: {
    //"/gateway": "http://a2.iengage:31601" // gp-security dmz access (NO RELYING PARTY)
    // "/gateway": "http://localhost:8080" // gp-security dmz access (NO RELYING PARTY)
  },
  target: defaultRoute,
  pathRewrite: {
    //'^/gateway': '', // Host path & target path conversion
  }
};
