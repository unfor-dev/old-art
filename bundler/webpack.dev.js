const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ip = require('internal-ip');
const portFinderSync = require('portfinder-sync');

const infoColor = msg => `\u001b[1m\u001b[34m${msg}\u001b[39m\u001b[22m`;

module.exports = merge(common, {
  stats: 'errors-warnings',
  mode: 'development',
  devServer: {
    host: 'local-ip',
    port: portFinderSync.getPort(8080),
    open: true,
    https: false,
    allowedHosts: 'all',
    hot: false,
    watchFiles: ['src/**', 'static/**'],
    static: {
      watch: true,
      directory: path.join(__dirname, '../static')
    },
    client: {
      logging: 'none',
      overlay: true,
      progress: false
    },
    onAfterSetupMiddleware(devServer) {
      const port = devServer.options.port;
      const https = devServer.options.https ? 's' : '';
      const localIp = ip.v4.sync();
      console.log(`Project running at:\n  - ${infoColor(`http${https}://${localIp}:${port}`)}\n  - ${infoColor(`http${https}://localhost:${port}`)}`);
    }
  }
});
