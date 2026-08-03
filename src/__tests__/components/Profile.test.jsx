import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../../pages/Profile.jsx';

const mockProps = {
  favorites: [],
  removeFromFavorites: vi.fn(),
};

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render empty state when no favorites', () => {
    render(
      <MemoryRouter>
        <Profile {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Your collection is empty/i)).toBeInTheDocument();
  });

  it('should render page title', () => {
    render(
      <MemoryRouter>
        <Profile {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/My Space Collection/i)).toBeInTheDocument();
  });

  it('should render Go Explore button when empty', () => {
    render(
      <MemoryRouter>
        <Profile {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Go Explore/i)).toBeInTheDocument();
  });

  it('should render favorites when provided', () => {
    const favorites = [
      {
        id: '2024-01-15-Test Image',
        title: 'Test Image',
        date: '2024-01-15',
        url: 'https://example.com/image.jpg',
        media_type: 'image',
        explanation: 'A test image.',
        addedAt: '2024-01-15T12:00:00Z',
      },
    ];

    render(
      <MemoryRouter>
        <Profile {...mockProps} favorites={favorites} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Test Image')).toBeInTheDocument();
    expect(screen.getByText(/1 saved item/)).toBeInTheDocument();
  });

  it('should show correct count for multiple favorites', () => {
    const favorites = [
      { id: '1', title: 'Image 1', date: '2024-01-01', url: 'url1', media_type: 'image', explanation: 'test', addedAt: '2024-01-01T00:00:00Z' },
      { id: '2', title: 'Image 2', date: '2024-01-02', url: 'url2', media_type: 'image', explanation: 'test', addedAt: '2024-01-02T00:00:00Z' },
    ];

    render(
      <MemoryRouter>
        <Profile {...mockProps} favorites={favorites} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/2 saved items/)).toBeInTheDocument();
  });
});
