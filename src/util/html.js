const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, ch => ENTITIES[ch]);
}

export function formatDate(iso, long = false) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(+date)) return '';
  return date.toLocaleDateString(undefined,
    long ? { year: 'numeric', month: 'short', day: 'numeric' } : { year: 'numeric', month: 'short' });
}
