const crypto = require('crypto');

function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const keys = Object.keys(obj).sort();
  const entries = keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return `{${entries.join(',')}}`;
}

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function signEd25519Hex(messageHex, privateKeyPem) {
  try {
    if (!privateKeyPem) return null;
    const keyObj = crypto.createPrivateKey(privateKeyPem);
    const message = Buffer.from(messageHex, 'hex');
    const signature = crypto.sign(null, message, keyObj);
    return signature.toString('hex');
  } catch (e) {
    return null;
  }
}

module.exports = {
  stableStringify,
  sha256Hex,
  signEd25519Hex
};

