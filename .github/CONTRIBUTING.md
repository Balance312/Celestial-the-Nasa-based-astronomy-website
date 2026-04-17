# Contributing to Celestial 🌌

Thank you for your interest in contributing! Whether it's a bug fix, a new feature, or a documentation improvement — all contributions are welcome.

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. Create a new branch for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Install dependencies and configure your environment (see [README.md](../README.md#-getting-started)).
4. Make your changes.
5. Run lint and tests to make sure everything passes:
   ```bash
   npm run lint
   npm test
   ```
6. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add APOD date picker
   fix: handle missing copyright field
   docs: update API reference section
   ```
7. Push your branch and open a **Pull Request** against `main`.

## Code Style

- Follow the existing ESLint configuration (`eslint.config.js`).
- Use Tailwind CSS utility classes for styling; avoid writing raw CSS unless necessary.
- Keep components small and focused on a single responsibility.
- Write or update tests for any new logic in `src/__tests__/`.

## Reporting Bugs

Please use the [Bug Report](ISSUE_TEMPLATE/bug_report.md) issue template.

## Requesting Features

Please use the [Feature Request](ISSUE_TEMPLATE/feature_request.md) issue template.

## Code of Conduct

By participating in this project you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
