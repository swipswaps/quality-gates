# Quality Gates

Automated code quality enforcement tools for TypeScript/React and Python projects.

## How We Got Here

This project emerged from building a **receipts-ocr** application—a Vite + React + TypeScript frontend with a Flask + PaddleOCR + PostgreSQL backend. During development and code audit, we identified recurring issues that slipped through manual review:

### Issues Found

| Issue | File | Root Cause |
|-------|------|------------|
| `any` types in catch blocks | `App.tsx`, `ocrService.ts` | TypeScript's `catch (e)` defaults to `any` |
| Missing `useCallback` dependencies | `App.tsx` | React hooks require explicit deps |
| Unused `@ts-expect-error` directives | `ocrService.ts` | Stale suppression comments |
| 1.6MB bundle size | Production build | Heavy library (Tesseract.js) imported at top-level |
| Missing Python type hints | `app.py` | No static type checking configured |
| No unit tests for parsing logic | Both frontend/backend | Coverage not enforced |

### The Fix Pattern

Each issue was fixed manually:

```typescript
// BEFORE: any type in catch block
} catch (e: any) {
  console.error(e.message);
}

// AFTER: unknown with type guard
} catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(msg);
}
```

**The problem:** These fixes don't prevent the same mistakes in future code.

---

## Where We Are

This repository provides **automated quality gates** that catch these issues before code is merged:

```
quality-gates/
├── .pre-commit-config.yaml    # Local hooks (run before commit)
├── .github/workflows/
│   └── quality.yml            # CI pipeline (run on PR)
├── configs/
│   ├── eslint.config.js       # TypeScript/React linting
│   ├── pyproject.toml         # Python linting (ruff + mypy)
│   └── size-limit.json        # Bundle size limits
├── dangerfile.ts              # PR review automation
└── scripts/
    └── check-bundle-size.sh   # Bundle size enforcement
```

### Three Layers of Defense

| Layer | When | Speed | Catches |
|-------|------|-------|---------|
| Pre-commit | Before commit | Fast | Lint, types, format |
| CI Pipeline | On PR | Medium | Tests, bundle size, coverage |
| Danger.js | On PR | Fast | Missing tests, code smells |

---

## Quick Start

```bash
# Copy to your project
cp .pre-commit-config.yaml /path/to/project/
cp -r configs/* /path/to/project/
cp -r .github /path/to/project/

# Install and activate
cd /path/to/project
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

---

## What Each Tool Catches

| Tool | Issue | Auto-fix |
|------|-------|----------|
| ESLint | `any` types, hook deps, unused vars | Some |
| TypeScript | Type errors | No |
| size-limit | Bundle > threshold | No |
| ruff | Python style, imports | Yes |
| mypy | Missing type hints | No |
| pytest-cov | Coverage < 80% | No |
| danger-js | PRs without tests | No |

---

## Logical Next Steps

### Phase 1: Immediate
- [ ] Add auto-fix mode (`--fix` flags)
- [ ] Add caching to speed up CI
- [ ] Incremental checking (only changed files)

### Phase 2: Security & Dependencies
- [ ] Add `bandit` (Python security)
- [ ] Add `npm audit` (JS security)
- [ ] Add Dependabot/Renovate config

### Phase 3: Advanced
- [ ] Custom ESLint rules
- [ ] Mutation testing
- [ ] Visual regression testing
- [ ] Performance budgets (Lighthouse CI)

### Phase 4: Metrics
- [ ] Quality dashboard
- [ ] Technical debt tracking
- [ ] SonarQube/CodeClimate integration

---

## License

MIT
