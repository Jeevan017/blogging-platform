export const parseTags = (tagsInput) => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) {
    return tagsInput.map((tag) => tag.trim()).filter(Boolean);
  }
  return String(tagsInput)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export const tagsToString = (tags) => {
  if (!tags) return '';
  if (Array.isArray(tags)) return tags.join(', ');
  return String(tags);
};
