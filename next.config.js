const path = require('path')

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    },
      config.watchOptions = {
        poll: 1000,   // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      };

    return config
  },
}

module.exports = nextConfig
