import { useNavigate } from 'react-router-dom';
import { encodePath } from './encodedRoutes';

/**
 * Drop-in replacement for useNavigate().
 * Automatically encodes the path before navigating.
 *
 * Usage:
 *   const navigate = useNavigateEncoded();
 *   navigate('/dashboard');   // browser shows encoded URL
 */
const useNavigateEncoded = () => {
  const navigate = useNavigate();
  return (path, options) => navigate(encodePath(path), options);
};

export { useNavigateEncoded };