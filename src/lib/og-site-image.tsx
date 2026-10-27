import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

const INK = '#14110f';
const PAPER = '#f6f1e7';
const MINT = '#00b86b';
const PINK = '#ff8fb1';

/** Site-wide share card used when the app itself (not a single post) is shared. */
export function renderSiteOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: PAPER,
          padding: '56px 70px',
          fontFamily: 'sans-serif',
          color: INK,
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: MINT,
                border: `4px solid ${INK}`,
                boxShadow: `6px 6px 0 ${INK}`,
                fontSize: 36,
                fontWeight: 900,
                color: '#04170d',
                transform: 'rotate(-6deg)',
              }}
            >
              B
            </div>
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 900, letterSpacing: -1 }}>
              Blog<span style={{ color: MINT }}>App</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: PINK,
              border: `4px solid ${INK}`,
              boxShadow: `5px 5px 0 ${INK}`,
              padding: '8px 22px',
              fontSize: 24,
              fontWeight: 800,
              transform: 'rotate(3deg)',
            }}
          >
            Fresh reads
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 104, fontWeight: 900, lineHeight: 1.0, letterSpacing: -3 }}>
            Stories and ideas
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', fontSize: 104, fontWeight: 900, lineHeight: 1.0, letterSpacing: -3, marginRight: 28 }}>
              worth
            </div>
            <div
              style={{
                display: 'flex',
                backgroundColor: MINT,
                color: '#04170d',
                border: `5px solid ${INK}`,
                boxShadow: `10px 10px 0 ${INK}`,
                padding: '0 30px 8px',
                fontSize: 104,
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: -3,
                transform: 'rotate(-2deg)',
              }}
            >
              reading.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: '#5b564f' }}>
            Thoughts, tutorials and deep dives from our community.
          </div>
          <div
            style={{
              display: 'flex',
              backgroundColor: INK,
              color: PAPER,
              padding: '12px 30px',
              borderRadius: 999,
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            Read the latest →
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
