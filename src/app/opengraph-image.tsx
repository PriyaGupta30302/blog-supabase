import { renderSiteOgImage } from '@/lib/og-site-image';

export const alt = 'BlogApp: stories and ideas worth reading';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderSiteOgImage();
}
