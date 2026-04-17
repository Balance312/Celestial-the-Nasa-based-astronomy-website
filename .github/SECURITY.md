# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (`main`) | ✅ |

## Reporting a Vulnerability

If you discover a security vulnerability in Celestial, please **do not** open a public GitHub issue.

Instead, report it privately:

1. Open a [GitHub Security Advisory](https://github.com/Balance312/Celestial-the-Nasa-based-astronomy-website/security/advisories/new) (preferred).
2. Or email the maintainer directly via GitHub profile contact.

Please include:
- A description of the vulnerability
- Steps to reproduce it
- Any potential impact

You can expect an acknowledgment within **48 hours** and a resolution plan within **7 days**.

## Security Best Practices for Contributors

- Never commit `.env` files or API keys to the repository.
- Use `.env.example` as a template — it must never contain real credentials.
- All NASA API calls that could expose keys should go through the `/api` serverless proxy.
