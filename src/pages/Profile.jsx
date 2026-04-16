import { Link } from 'react-router-dom';
import './pages.css';

function Profile({ favorites, removeFromFavorites }) {
  return (
    <div className="profile-page">
      <div className="page-hero profile-hero">
        <div className="hero-content">
          <h1 className="page-title">My Space Collection</h1>
          <p className="page-subtitle">
            Your personal archive of cosmic moments and discoveries.
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="collection-summary mb-4">
          <div className="summary-chip">
            <i className="bi bi-stars"></i>
            <span>{favorites.length} saved item{favorites.length === 1 ? '' : 's'}</span>
          </div>
          <p className="summary-text">
            Items are sorted by when you added them to your profile.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-collection text-center">
            <i className="bi bi-heartbreak empty-icon"></i>
            <h2>Your collection is empty</h2>
            <p>Start exploring APOD entries and save the ones you love.</p>
            <Link to="/apod" className="btn btn-primary go-explore-btn">
              Go Explore
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favorites.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-xl-4">
                <div className="card profile-card h-100">
                  {item.media_type === 'image' ? (
                    <img src={item.url} className="card-img-top profile-image" alt={item.title} />
                  ) : (
                    <div className="profile-video-placeholder">
                      <i className="bi bi-play-circle"></i>
                      <span>Video Entry</span>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title profile-card-title">{item.title}</h5>
                    <div className="profile-meta">
                      <span>
                        <i className="bi bi-calendar-event"></i>
                        APOD Date: {item.date}
                      </span>
                      <span>
                        <i className="bi bi-clock-history"></i>
                        Added: {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="card-text profile-explanation">{item.explanation}</p>
                    <div className="mt-auto d-flex gap-2 pt-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-light btn-sm"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        Open
                      </a>
                      <button
                        className="btn btn-danger btn-sm ms-auto"
                        onClick={() => removeFromFavorites(item.id)}
                      >
                        <i className="bi bi-trash3-fill me-1"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
