import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FaLock, FaSignInAlt } from 'react-icons/fa';
import Seo from '../../../components/common/Seo';
import { loginSucceeded, selectIsAdmin } from '../../../features/admin/adminSlice';
import { getErrorMessage, useAdminLoginMutation } from '../../../services/adminApi';
import styles from '../Admin.module.css';

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useSelector(selectIsAdmin);
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useAdminLoginMutation();

  const redirectTo = location.state?.from?.startsWith('/admin') ? location.state.from : '/admin';

  if (isAdmin) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token } = await login(password).unwrap();
      dispatch(loginSucceeded(token));
      navigate(redirectTo, { replace: true });
    } catch {
      setPassword('');
    }
  };

  return (
    <div className={styles.loginPage}>
      <Seo title="Admin Login" noindex />
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <div className={styles.loginIcon}>
          <FaLock aria-hidden="true" />
        </div>
        <h1>Admin Login</h1>
        <p className={styles.muted}>Enter the admin password to manage app listings.</p>

        {error && (
          <div className={styles.errorBanner} role="alert">
            {getErrorMessage(error, 'Login failed.')}
          </div>
        )}

        <label className={styles.field}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>

        <button type="submit" className={styles.primaryBtn} disabled={isLoading || !password}>
          <FaSignInAlt aria-hidden="true" /> {isLoading ? 'Logging in…' : 'Log in'}
        </button>

        <Link to="/" className={styles.backLink}>
          ← Back to site
        </Link>
      </form>
    </div>
  );
}
