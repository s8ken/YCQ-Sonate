const crypto = require('crypto');

module.exports = function verifyWebhookSignature({ header = 'x-symbi-signature', secretEnv = 'WEBHOOK_SECRET' } = {}) {
  return (req, res, next) => {
    try {
      const secret = process.env[secretEnv];
      if (!secret) return next(); // no-op if not configured

      const signature = req.get(header) || '';
      const body = req.rawBody || JSON.stringify(req.body || {});

      const hmac = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');

      const a = Buffer.from(signature);
      const b = Buffer.from(hmac);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Signature check failed' });
    }
  };
};

