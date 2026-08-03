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

    expect(screen.getByText(/Universal Space Gallery/i)).toBeInTheDocument();
  });

  it('should render filter chips and loading state', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <GalleryPage {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /Images/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Video/i })).toBeInTheDocument();
    const loadingButton = screen.getByRole('button', { name: /Loading/i });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();
  });
});
