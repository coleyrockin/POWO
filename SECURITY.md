# Security Policy

## Supported Versions

This repository is maintained as a public portfolio project. Security fixes are handled on the default branch.

## Reporting a Vulnerability

Please do not open a public issue for suspected vulnerabilities. Email boydcroberts@gmail.com with:

- the affected repository and URL
- impact and reproduction steps
- relevant logs, screenshots, or proof of concept

I will acknowledge reports as soon as practical and coordinate fixes or disclosure notes when needed.

## Data Handling

This public repository should only contain curated dashboard data. Do not commit raw Apple Health exports, zipped exports, private `.env` files, or generated local preview artifacts. The repository `.gitignore` blocks the common private export folders and health-export filenames.

## Routine Checks

Before a release, run:

```bash
npm run verify
npm run audit:prod
```
