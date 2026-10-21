/**
 * Lighthouse CI budgets (spec section 9), checked on the generated static site
 * with Lighthouse's default mobile emulation and throttling.
 *
 *   pnpm generate && pnpm lhci
 *
 * Locally, point CHROME_PATH at a Chrome/Chromium binary if one isn't found.
 */
const pages = [
  '/',
  '/en',
  '/sobre',
  '/areas-de-atuacao/direito-empresarial',
  '/equipe/ana-ribeiro',
  '/blog',
  '/blog/planejamento-sucessorio',
  '/en/blog/succession-planning',
  '/contato',
]

const port = Number(process.env.LHCI_PORT ?? 4174)

module.exports = {
  ci: {
    collect: {
      startServerCommand: `PORT=${port} node tests/support/static-server.ts`,
      startServerReadyPattern: 'Serving',
      url: pages.map(p => `http://localhost:${port}${p}`),
      // Median of 3 runs smooths out simulated-throttling noise.
      numberOfRuns: 3,
      settings: {
        // Sandbox flags are needed in containers and CI runners.
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      // Reports are kept as CI artifacts; no external upload server is needed.
      target: 'filesystem',
      outputDir: '.lighthouseci/reports',
    },
  },
}
