import DOMPurify from 'dompurify';

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
};

export const sanitizeHtml = (dirty) => {
  if (dirty == null) return '';
  return DOMPurify.sanitize(String(dirty), SANITIZE_CONFIG);
};

export default sanitizeHtml;
