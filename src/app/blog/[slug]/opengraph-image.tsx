import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';
import { stripHtml } from '@/lib/text-utils';

export const alt = 'Blog Story Preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug || '');

  let blog = null;
  try {
    const { data } = await supabase
      .from('blogs')
      .select('title, description, content, img, author_name, tags')
      .or(`slug.eq.${slug},slug.eq.${decodedSlug}`)
      .maybeSingle();
    blog = data;
  } catch (e) {
    console.error('Error loading blog for OG Image:', e);
  }

  const title = blog?.title || 'Blog Story';
  const author = blog?.author_name || 'BlogApp Community';
  const rawDesc = stripHtml(blog?.description || blog?.content || '');
  const description = rawDesc ? (rawDesc.length > 120 ? `${rawDesc.slice(0, 120)}...` : rawDesc) : 'Discover thoughts, ideas, and stories from our community.';
  const featuredImg = blog?.img && blog.img.startsWith('http') ? blog.img : null;
  const tag = blog?.tags?.[0] || 'Story';

  // If blog has a featured image, render a full-bleed large image banner card (like Amazon product cards)
  if (featuredImg) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#090d16',
            position: 'relative',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Main Full-Bleed Featured Image */}
          <img
            src={featuredImg}
            alt={title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Dark Gradient Overlay for perfect readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(9, 13, 22, 0.95) 100%)',
            }}
          />

          {/* Top Header Badge */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 50px 0 50px',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                }}
              >
                B
              </div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                }}
              >
                BlogApp
              </span>
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#ffffff',
                backgroundColor: 'rgba(99, 102, 241, 0.85)',
                padding: '6px 16px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {tag}
            </div>
          </div>

          {/* Bottom Overlay Title & Metadata */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '0 50px 45px 50px',
            }}
          >
            <h1
              style={{
                fontSize: title.length > 50 ? '42px' : '50px',
                fontWeight: '900',
                lineHeight: 1.15,
                color: '#ffffff',
                margin: 0,
                textShadow: '0 2px 12px rgba(0,0,0,0.9)',
                letterSpacing: '-0.5px',
              }}
            >
              {title}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                marginTop: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#ffffff',
                  }}
                >
                  {author[0]?.toUpperCase() || 'A'}
                </div>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                  {author}
                </span>
              </div>

              <span style={{ fontSize: '16px', color: '#cbd5e1', fontWeight: '500' }}>
                Read story on BlogApp
              </span>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  // Fallback typography card if blog has no image
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#090d16',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.3), transparent 45%), radial-gradient(circle at 85% 80%, rgba(168, 85, 247, 0.25), transparent 45%)',
          padding: '55px 60px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#ffffff',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
              }}
            >
              B
            </div>
            <span style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', color: '#f8fafc' }}>
              BlogApp
            </span>
          </div>

          <div
            style={{
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#c084fc',
              backgroundColor: 'rgba(192, 132, 252, 0.15)',
              padding: '6px 18px',
              borderRadius: '20px',
              border: '1px solid rgba(192, 132, 252, 0.3)',
            }}
          >
            {tag}
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
          <h1
            style={{
              fontSize: title.length > 50 ? '46px' : '56px',
              fontWeight: '900',
              lineHeight: 1.16,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.8px',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: '22px',
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#ffffff',
              }}
            >
              {author[0]?.toUpperCase() || 'A'}
            </div>
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#e2e8f0' }}>
              Written by {author}
            </span>
          </div>

          <span style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>
            Read full story on BlogApp
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
