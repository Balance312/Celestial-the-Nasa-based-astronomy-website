import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import APODPage from '../../pages/APODPage.jsx';

const mockProps = {
  addToFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
  isFavorited: vi.fn().mockReturnValue(false),
};

describe('APODPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render loading state initially', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <APODPage {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Fetching cosmic wonders/i)).toBeInTheDocument();
  });

  it('should render page hero title', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <APODPage {...mockProps} />
      </MemoryRouter>,
    );

    const titles = screen.getAllByText(/Astronomy Picture of the Day/i);
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('should render date navigation controls', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <APODPage {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Previous Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Next Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Today/i)).toBeInTheDocument();
  });

  it('should render history note with start date', () => {
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <APODPage {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/June 16, 1995/i)).toBeInTheDocument();
  });
});
