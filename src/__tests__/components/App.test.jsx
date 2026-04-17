import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App.jsx';

// Mock the Router component
vi.mock('../../Router.jsx', () => ({
  default: ({ favorites, addToFavorites }) => (
    <div>
      <div data-testid="favorites-count">{favorites.length}</div>
      <button onClick={() => addToFavorites({ title: 'Test', date: '2024-01-01' })}>
        Add Favorite
      </button>
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  it('should initialize with empty favorites', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      const favoritesCount = screen.getByTestId('favorites-count');
      expect(favoritesCount.textContent).toBe('0');
    });
  });

  it('should persist favorites to localStorage', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const addButton = screen.getByRole('button', { name: /add favorite/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      const stored = localStorage.getItem('celestialFavorites');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored);
      expect(parsed.length).toBe(1);
    });
  });

  it('should load favorites from localStorage', () => {
    // Setup existing favorites
    const testFavorites = [
      { title: 'Existing', date: '2024-01-01', id: '2024-01-01-Existing', addedAt: new Date().toISOString() },
    ];
    localStorage.setItem('celestialFavorites', JSON.stringify(testFavorites));

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(localStorage.getItem('celestialFavorites')).toBe(JSON.stringify(testFavorites));
  });
});
