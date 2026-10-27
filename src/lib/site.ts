/**
 * Canonical site URL used for metadata / Open Graph links.
 * Prefer an explicit NEXT_PUBLIC_APP_URL, then Vercel's production domain
 * (stable, public), then the per-deployment URL, then localhost.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    'localhost:3000';

  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const isLocal = raw.startsWith('localhost') || raw.startsWith('127.0.0.1');
  return `${isLocal ? 'http' : 'https'}://${raw}`;
}
