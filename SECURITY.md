# Security policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability or leaked credential. Use GitHub's
private vulnerability reporting for this repository. If that channel is unavailable, contact the
repository owner through an established private channel with a concise description, affected route
or component, reproduction steps, and the potential impact.

Never include active credentials, identity documents, payment data, or other personal data in a
report. Use synthetic examples and redact tokens after the first four characters.

## Automated controls

- CodeQL analyzes JavaScript and TypeScript on pull requests, protected branches, and weekly.
- Dependabot checks npm packages and GitHub Actions weekly; security updates remain managed by
  GitHub's dependency security features.
- Gitleaks scans the complete Git history on pull requests, protected branches, and weekly.
- GitHub secret scanning and push protection should remain enabled in repository settings.

Any exposed secret must be revoked or rotated immediately. Removing it from the latest commit is
not sufficient because it remains present in Git history.
