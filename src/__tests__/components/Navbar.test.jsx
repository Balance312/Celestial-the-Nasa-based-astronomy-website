import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../Components/Navbar.jsx';

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Celestial brand', () => {
    render(
      <MemoryRouter>
        <Navbar favoritesCount={0} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Celestial')).toBeInTheDocument();
  });

  it('should render all navigation links', () => {
    render(
      <MemoryRouter>
        <Navbar favoritesCount={0} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText("Today's APOD")).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Earth EPIC')).toBeInTheDocument();
    expect(screen.getByText('My Space Collection')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('should display favorites count badge when count > 0', () => {
    render(
      <MemoryRouter>
        <Navbar favoritesCount={5} />
      </MemoryRouter>,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render mobile toggle button', () => {
    render(
      <MemoryRouter>
        <Navbar favoritesCount={0} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Toggle navigation')).toBeInTheDocument();
  });

  it('should show badge with 0 when count is 0', () => {
    render(
      <MemoryRouter>
        <Navbar favoritesCount={0} />
      </MemoryRouter>,
    );

    const badges = screen.getAllByText('0');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
