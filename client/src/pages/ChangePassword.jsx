import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuth from '../hooks/useAuth.js';
import * as userService from '../services/userService.js';
import { ROUTES } from '../utils/constants.js';
import getErrorMessage from '../utils/getErrorMessage.js';
import { showSuccess } from '../utils/toast.js';

const ChangePassword = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      showSuccess('Password changed successfully!');
      navigate(ROUTES.PROFILE(user._id), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to change password.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <Loader label="Loading..." />;
  }

  return (
    <section className="form-page">
      <h1>Change Password</h1>
      <p className="text-muted">Update your password to keep your account secure</p>

      <ErrorMessage message={error} />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            className="premium-input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            disabled={submitting}
          />
          {fieldErrors.currentPassword && (
            <span className="field-error">{fieldErrors.currentPassword}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            className="premium-input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />
          {fieldErrors.newPassword && (
            <span className="field-error">{fieldErrors.newPassword}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            className="premium-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />
          {fieldErrors.confirmPassword && (
            <span className="field-error">{fieldErrors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className={`btn btn--primary${submitting ? ' btn--loading' : ''}`}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Changing password...' : 'Change Password'}
        </button>
      </form>
    </section>
  );
};

export default ChangePassword;