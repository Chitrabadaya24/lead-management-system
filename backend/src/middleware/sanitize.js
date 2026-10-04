// Removes Mongo operator keys ($, .) and angle brackets from all input (NoSQL injection / XSS hardening).
const clean = (v, key) => {
  if (Array.isArray(v)) return v.map((x) => clean(x));
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v)
      .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
      .map(([k, x]) => [k, clean(x, k)]));
  }
  if (typeof v === 'string' && key !== 'password') return v.replace(/[<>]/g, '').trim();
  return v;
};
module.exports = (req, _res, next) => { req.body = clean(req.body); req.query = clean(req.query); next(); };
