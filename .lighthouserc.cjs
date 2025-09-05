// @ts-check

const BASE = process.env.LHCI_BASE || 'http://localhost:3000';
const FORM = process.env.LHCI_FORM_FACTOR || 'desktop'; // 'desktop' | 'mobile'
const DATE = new Date().toISOString().slice(0, 10);

const envUrls = process.env.LHCI_URLS
  ? process.env.LHCI_URLS.split(',').map((p) => `${BASE}${p.startsWith('/') ? '' : '/'}${p}`)
  : null;
const urls = envUrls && envUrls.length > 0
  ? envUrls
  : [
      `${BASE}/`,
      `${BASE}/catalog/ognetushiteli`,
      `${BASE}/lp/ognetushiteli-tashkent`,
    ];

const config = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: 3,
      settings: FORM === 'mobile'
        ? {
            emulatedFormFactor: 'mobile',
            throttling: {
              rttMs: 150,
              throughputKbps: 1600,
              cpuSlowdownMultiplier: 4,
            },
          }
        : {
            emulatedFormFactor: 'desktop',
            throttling: {
              rttMs: 40,
              throughputKbps: 10 * 1024,
              cpuSlowdownMultiplier: 1,
            },
          },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.90 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: `./seo-reports/${DATE}/${FORM}`,
      reportFilenamePattern: '%%HOSTNAME%%-%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
  },
};

module.exports = config;
