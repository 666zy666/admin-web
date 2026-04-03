/**
 * Image URL normalization utility.
 *
 * Backend serializers may return:
 *   - Absolute URL: "http://127.0.0.1:8000/media/banners/..."  (via build_absolute_uri)
 *   - Relative path: "/media/banners/..."  (when request context is absent)
 *   - null / empty string: no image
 *
 * Rule priority:
 *   1. Absolute URL → return as-is
 *   2. Relative path → prepend VITE_API_BASE_URL (from env, no hard-coded domain)
 *   3. Falsy value  → return '' to prevent broken-image UI
 */
export function normalizeImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  // Relative path: prepend the configured API base URL
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}
