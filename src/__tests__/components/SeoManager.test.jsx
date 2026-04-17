import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SeoManager from '../../Components/SeoManager.jsx';

describe('SeoManager Component', () => {
  beforeEach(() => {
    // Clear document head
    document.head.innerHTML = '';
  });

  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<SeoManager />} />
          <Route path="/apod" element={<SeoManager />} />
          <Route path="/gallery" element={<SeoManager />} />
          <Route path="/about" element={<SeoManager />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should set title for home page', () => {
    renderWithRouter('/');
    expect(document.title).toContain('Celestial');
  });

  it('should set title for APOD page', () => {
    renderWithRouter('/apod');
    expect(document.title).toContain("Today's APOD");
  });

  it('should set meta description', () => {
    renderWithRouter('/');
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription?.content).toBeDefined();
    expect(metaDescription?.content.length).toBeGreaterThan(0);
  });

  it('should set canonical URL', () => {
    renderWithRouter('/gallery');
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.href).toBeDefined();
  });

  it('should set og:title meta tag', () => {
    renderWithRouter('/about');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.content).toBeDefined();
  });
});
