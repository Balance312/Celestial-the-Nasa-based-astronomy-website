import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-7xl font-bold text-cyan-glow">404</div>
      <h1 className="mb-2 text-2xl font-bold text-text-bright">Page Not Found</h1>
      <p className="mb-8 max-w-md text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <i className="bi bi-house mr-2"></i>
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
