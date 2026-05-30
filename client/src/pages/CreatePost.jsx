import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import PostForm from '../components/post/PostForm.jsx';
import * as postService from '../services/postService.js';
import { buildPostFormData } from '../utils/buildFormData.js';
import { ROUTES } from '../utils/constants.js';
import getErrorMessage from '../utils/getErrorMessage.js';
import { showSuccess } from '../utils/toast.js';

const CreatePost = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    setError('');

    try {
      const formData = buildPostFormData(formValues);
      const post = await postService.createPost(formData);
      showSuccess('Post published successfully!');
      navigate(ROUTES.POST(post._id), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create post.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-page form-page--wide">
      <h1>Create Post</h1>
      <p className="text-muted">Share your ideas with the community</p>
      <ErrorMessage message={error} />
      <PostForm onSubmit={handleSubmit} submitLabel="Create Post" submitting={submitting} />
    </section>
  );
};

export default CreatePost;
