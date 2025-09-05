// Mock for next/config
module.exports = () => ({
  publicRuntimeConfig: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  },
});
