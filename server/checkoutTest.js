// This permits navigation only. It cannot put Shopify into test mode or disable AutoDS.
export function localCheckoutTest(env, req, now = Date.now()) {
  const expiry = Date.parse(env.PONDNEST_CHECKOUT_TEST_EXPIRES_AT || '');
  const ip = req.socket?.remoteAddress?.replace(/^::ffff:/, '');
  const host = req.headers.host || '';
  return env.PONDNEST_LOCAL_TEST_SERVER === 'true'
    && env.PONDNEST_SHOPIFY_TEST_CONFIRMED === 'true'
    && env.PONDNEST_AUTODS_DISABLED_CONFIRMED === 'true'
    && ['127.0.0.1', '::1'].includes(ip)
    && /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)
    && Number.isFinite(expiry) && expiry > now && expiry - now <= 3600000;
}
