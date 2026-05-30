import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuth from '../hooks/useAuth.js';
import { ROUTES } from '../utils/constants.js';
import getErrorMessage from '../utils/getErrorMessage.js';
import { showSuccess } from '../utils/toast.js';

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || ROUTES.HOME;

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  const validate = () => {
    const errors = {};

    if (!loginField.trim()) {
      errors.loginField = 'Email or username is required';
    }

    if (!password) {
      errors.password = 'Password is required';
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
      await login({ email: loginField.trim(), password });
      showSuccess('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <Loader label="Checking session..." />;
  }

  return (
    <section className="auth-page">
      <h1>Welcome back</h1>
      <p className="text-muted">Sign in to continue to BlogSpace</p>

      <ErrorMessage message={error} />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="loginField">Email or Username</label>
          <input
            id="loginField"
            className="premium-input"
            type="text"
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
            autoComplete="username"
            disabled={submitting}
          />
          {fieldErrors.loginField && <span className="field-error">{fieldErrors.loginField}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="premium-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={submitting}
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>

        <button
          type="submit"
          className={`btn btn--primary${submitting ? ' btn--loading' : ''}`}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Logging in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-page__switch">
        Don&apos;t have an account? <Link to={ROUTES.REGISTER}>Register</Link>
      </p>
    </section>
  );
};

export default Login;
