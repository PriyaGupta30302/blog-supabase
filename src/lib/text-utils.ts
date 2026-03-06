/**
 * Strips HTML tags from a string and decodes basic entities.
 * @param html The HTML string to strip
 * @returns The plain text content
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  
  // First decode basic entities that might contain < or >
  const decoded = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
  
  // Then strip all tags
  return decoded.replace(/<[^>]*>?/gm, '');
}

/**
 * Formats a date string consistently to avoid hydration mismatches.
 * @param dateString The ISO date string
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}
