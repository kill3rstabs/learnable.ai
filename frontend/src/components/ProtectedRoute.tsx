import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ isAuthed, children }: { isAuthed: boolean; children: JSX.Element }) {
  const location = useLocation();
  if (!isAuthed) {
    // Always redirect to /login with redirect to /input (per your preference)
    const redirectTo = encodeURIComponent('/input');
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }
  return children;
} 