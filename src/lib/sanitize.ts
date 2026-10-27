import sanitizeHtml from 'sanitize-html';

const COLOR = [
  /^#[0-9a-f]{3,8}$/i,
  /^rgba?\([\d\s.,%/]+\)$/i,
  /^hsla?\([\d\s.,%/deg]+\)$/i,
  /^[a-z]+$/i,
];

/**
 * Sanitizes rich-text blog HTML (as produced by the Tiptap editor) for rendering.
 *
 * Pure JavaScript on purpose: the previous isomorphic-dompurify pulls in jsdom,
 * which crashes at require-time on some Node versions used by serverless hosts
 * (ERR_REQUIRE_ESM), taking the whole blog page down with a 500.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'mark', 'u'],
    allowedAttributes: {
      '*': ['style', 'data-color', 'data-type', 'colspan', 'rowspan', 'colwidth', 'class'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'class', 'style'],
    },
    // Keep syntax-highlighting classes only; drop arbitrary utility classes.
    allowedClasses: {
      pre: ['hljs', 'language-*'],
      code: ['hljs', 'language-*', 'hljs-*'],
      span: ['hljs-*'],
    },
    allowedStyles: {
      '*': {
        color: COLOR,
        'background-color': COLOR,
        'text-align': [/^(left|right|center|justify)$/],
      },
      img: {
        width: [/^\d+(\.\d+)?(px|%|em|rem)$/],
        height: [/^(\d+(\.\d+)?(px|%|em|rem)|auto)$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  });
}
