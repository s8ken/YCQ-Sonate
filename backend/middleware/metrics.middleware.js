const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpReqs = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

register.registerMetric(httpReqs);
register.registerMetric(httpDuration);

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    try {
      const route = (req.route && req.route.path) || req.path || 'unknown';
      const status = String(res.statusCode);
      const method = req.method;
      httpReqs.inc({ method, route, status });
      const dur = Number(process.hrtime.bigint() - start) / 1e9;
      httpDuration.observe({ method, route, status }, dur);
    } catch (_) {
      // ignore metrics errors
    }
  });
  next();
}

function mountMetrics(app) {
  app.get('/metrics', async (req, res) => {
    try {
      const token = process.env.METRICS_TOKEN;
      if (process.env.NODE_ENV === 'production' && token) {
        const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        if (auth !== token) return res.status(401).json({ error: 'unauthorized' });
      }
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (e) {
      res.status(500).json({ error: 'metrics_unavailable', message: e.message });
    }
  });
}

module.exports = { metricsMiddleware, mountMetrics, register };

