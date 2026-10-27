import sharp from 'sharp';

/**
 * Downloads a remote image and returns it as a 1200x630 JPEG data URI.
 *
 * The OG renderer (Satori) can't decode WebP, and big originals make previews
 * slow or get dropped by apps like WhatsApp, so we normalise to a small JPEG.
 * Returns null on any failure so callers can fall back to a text-only card.
 */
export async function toOgJpegDataUri(url: string, width = 1200, height = 630): Promise<string | null> {
  if (!url.startsWith('http')) return null;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!res.ok) return null;

    const input = Buffer.from(await res.arrayBuffer());
    const jpeg = await sharp(input)
      .rotate()
      .resize(width, height, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch (e) {
    console.error('OG image conversion failed:', e);
    return null;
  }
}
