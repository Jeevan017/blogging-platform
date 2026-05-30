import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuth from '../hooks/useAuth.js';
import * as userService from '../services/userService.js';
import { buildProfileFormData } from '../utils/buildFormData.js';
import { ROUTES } from '../utils/constants.js';
import getErrorMessage from '../utils/getErrorMessage.js';
import { showSuccess } from '../utils/toast.js';

const EditProfile = () => {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setImagePreview(user.profilePicture || '');
    }
  }, [user]);

  useEffect(() => {
    if (!imageFile) return undefined;

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = buildProfileFormData({ bio, profilePictureFile: imageFile });
      await userService.updateProfile(user._id, formData);
      await refreshUser();
      showSuccess('Profile updated successfully!');
      navigate(ROUTES.PROFILE(user._id), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <Loader label="Loading profile..." />;
  }

  return (
    <section className="form-page">
      <h1>Edit Profile</h1>
      <p className="text-muted">Update your bio and profile picture</p>
      <ErrorMessage message={error} />

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            className="premium-input"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={submitting}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label htmlFor="profilePicture">Profile Picture</label>
          <input
            id="profilePicture"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            disabled={submitting}
          />
          {imagePreview && (
            <img className="image-preview image-preview--avatar" src={imagePreview} alt="Profile preview" />
          )}
        </div>

        <button
          type="submit"
          className={`btn btn--primary${submitting ? ' btn--loading' : ''}`}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </section>
  );
};

export default EditProfile;
