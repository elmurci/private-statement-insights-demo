import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('VITE_NILCC_API_KEY:', env.VITE_NILCC_API_KEY ? '✓ Loaded' : '✗ Not found');

  return {
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/workload': {
          target: 'https://dummy.com', // Will be overridden by router
          changeOrigin: true,
          secure: false,
          router: (req) => {
            console.log('Router called with URL:', req.url);
            
            // req.url should be like /workload/WORKLOAD_ID/status
            const match = req.url?.match(/^\/workload\/([^/]+)/);
            
            if (match) {
              const workloadId = match[1];
              const target = `https://${workloadId}.workloads.nilcc.sandbox.nillion.network`;
              console.log('Matched! Routing to:', target);
              return target;
            }
            
            console.log('No match found');
            return 'https://dummy.com';
          },
          rewrite: (path) => {
            console.log('Rewrite called with path:', path);
            
            // Transform /workload/WORKLOAD_ID/status to /status
            const match = path.match(/^\/workload\/[^/]+(\/.*)?$/);
            
            if (match) {
              const endpoint = match[1] || '/';
              console.log('Rewritten to:', endpoint);
              return endpoint;
            }
            
            return path;
          }
        },
        '/api': {
          target: 'https://nilcc-api.sandbox.app-cluster.sandbox.nilogy.xyz',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const apiKey = env.VITE_NILCC_API_KEY || 'YOUR_API_KEY';
              console.log('🔄 Proxying:', req.method, req.url);
              console.log('🎯 To:', options.target + req.url);
              proxyReq.setHeader('x-api-key', apiKey);
            });
            proxy.on('error', (err, req, res) => {
              console.error('❌ Proxy error:', err);
            });
          },
        },
      },
    },
    plugins: [
      {
      name: 'nillion-workload-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
            // Only intercept /workload/* requests
            if (!req.url?.startsWith('/workload/')) {
              return next();
            }

            const match = req.url.match(/^\/workload\/([^/]+)(\/.*)?$/);
            
            if (!match) {
              return next();
            }

            const [, workloadId, endpoint = '/'] = match;
            const targetUrl = `https://${workloadId}.workloads.nilcc.sandbox.nillion.network${endpoint}`;
            
            console.log('🔄 Proxying to:', targetUrl);
            
            try {
              const response = await fetch(targetUrl);
              
              // Get the response body
              const text = await response.text();
 
              // Set proper headers
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = response.status;
              
              // Send the response
              res.end(text);
              return;
            } catch (error: any) {
              console.error('❌ Proxy error:', error.message);
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Proxy failed', details: error.message }));
              return;
            }
          });
        }
      },
      react(),
      nodePolyfills({
        include: ['stream', 'util', 'buffer', 'process', 'events'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    define: {
      global: 'globalThis',
    },
  };
});