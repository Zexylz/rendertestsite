module.exports = function override(config, env) {
  // New webpack config
  config.devServer = {
    ...config.devServer,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Your custom middleware setup here

      return middlewares;
    },
  };
  
  return config;
}