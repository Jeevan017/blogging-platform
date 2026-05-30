import { useEffect, useState } from 'react';
import { parseTags, tagsToString } from '../../utils/parseTags.js';

const PostForm = ({
  initialValues = {},
  onSubmit,
  submitLabel = 'Save',
  submitting = false,
}) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [content, setContent] = useState(initialValues.content || '');
  const [tagsInput, setTagsInput] = useState(tagsToString(initialValues.tags));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialValues.image || '');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setTitle(initialValues.title || '');
    setContent(initialValues.content || '');
    setTagsInput(tagsToString(initialValues.tags));
    setImagePreview(initialValues.image || '');
    setImageFile(null);
  }, [initialValues.title, initialValues.content, initialValues.tags, initialValues.image]);

  useEffect(() => {
    if (!imageFile) return undefined;

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!content.trim()) errors.content = 'Content is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tagsInput),
      imageFile,
    });
  };

  return (
    <form className="post-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className="premium-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'title-error' : undefined}
          placeholder="Write a compelling title..."
        />
        {fieldErrors.title && (
          <span id="title-error" className="field-error" role="alert">
            {fieldErrors.title}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          className="premium-input"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.content)}
          aria-describedby={fieldErrors.content ? 'content-error' : undefined}
          placeholder="Tell your story with clear headings, examples, and insight."
        />
        {fieldErrors.content && (
          <span id="content-error" className="field-error" role="alert">
            {fieldErrors.content}
          </span>
        )}
      </div>

      <div className="form-group form-group--tags">
        <label htmlFor="tags">Tags</label>
        <div className="tag-chip-list">
          {parseTags(tagsInput).map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
        <input
          id="tags"
          className="premium-input"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="react, node, mongodb"
          disabled={submitting}
        />
        <span className="form-hint">Separate tags with commas for better discoverability.</span>
      </div>

      <div className="image-upload-card">
        <div className="image-upload-card__header">
          <label htmlFor="image">Cover image</label>
          <p className="text-muted">Upload an image to make your story stand out.</p>
        </div>
        <input
          id="image"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={submitting}
        />
        {imagePreview && (
          <img className="image-preview" src={imagePreview} alt="Post preview" />
        )}
      </div>

      <div className="post-form__actions">
        <button
          type="submit"
          className={`btn btn--primary${submitting ? ' btn--loading' : ''}`}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <p className="form-hint">Use a strong headline and cover image to improve engagement.</p>
      </div>
    </form>
  );
};

export default PostForm;
