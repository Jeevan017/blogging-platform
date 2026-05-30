import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Loader from '../components/common/Loader.jsx';
import PostForm from '../components/post/PostForm.jsx';
import useAuth from '../hooks/useAuth.js';
import * as postService from '../services/postService.js';
import { buildPostFormData } from '../utils/buildFormData.js';
import { ROUTES } from '../utils/constants.js';
import getErrorMessage from '../utils/getErrorMessage.js';
import { showSuccess } from '../utils/toast.js';
import { isPostOwner } from '../utils/ownership.js';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError('');
    setForbidden(false);

    try {
      const data = await postService.getPostById(id);
      setPost(data);

    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setForbidden(true);
      } else {
        setError(getErrorMessage(err, 'Failed to load post.'));
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (post && user && !isPostOwner(post, user._id)) {
      setForbidden(true);
    }
  }, [post, user]);

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    setError('');

    try {
      const formData = buildPostFormData(formValues);
      const updated = await postService.updatePost(id, formData);
      showSuccess('Post updated successfully!');
      navigate(ROUTES.POST(updated._id), { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setForbidden(true);
      } else {
        setError(getErrorMessage(err, 'Failed to update post.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading post..." />;
  }

  if (forbidden) {
    return (
      <section className="form-page forbidden-page">
        <h1>403 — Not Authorized</h1>
        <p>You do not have permission to edit this post.</p>
        <Link to={ROUTES.HOME}>Back to Home</Link>
      </section>
    );
  }

  if (error && !post) {
    return (
      <section className="form-page">
        <ErrorMessage message={error} />
        <Link to={ROUTES.HOME}>Back to Home</Link>
      </section>
    );
  }

  return (
    <section className="form-page form-page--wide">
      <h1>Edit Post</h1>
      <p className="text-muted">Update your post content and settings</p>
      <ErrorMessage message={error} />
      <PostForm
        initialValues={{
          title: post.title,
          content: post.content,
          tags: post.tags,
          image: post.image,
        }}
        onSubmit={handleSubmit}
        submitLabel="Update Post"
        submitting={submitting}
      />
    </section>
  );
};

export default EditPost;
