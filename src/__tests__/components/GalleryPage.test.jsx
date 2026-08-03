import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GalleryPage from '../../pages/GalleryPage.jsx';

const mockProps = {
  addToFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
  isFavorited: vi.fn().mockReturnValue(false),
};

describe('GalleryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render loading state initially', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <GalleryPage {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Gathering cosmic wonders/i)).toBeInTheDocument();
  });

  it('should render page title', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <GalleryPage {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Cosmic Gallery/i)).toBeInTheDocument();
  });

  it('should render load button with loading state', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <GalleryPage {...mockProps} />
      </MemoryRouter>,
    );

    const loadButton = screen.getByRole('button', { name: /Load new images/i });
    expect(loadButton).toBeInTheDocument();
    expect(loadButton).toBeDisabled();
  });
});
