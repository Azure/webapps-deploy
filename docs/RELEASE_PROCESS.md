# Release Process Documentation

## Overview

This document describes the automated release process for `azure/webapps-deploy` GitHub Action.

---

## Branch Structure

| Branch | Purpose | Notes |
|--------|---------|-------|
| `master` | Active development | - |
| `releases/v3` | v3.x releases | Synced with `master` via cherry-pick |
| `releases/v2` | v2.x releases | Same codebase structure, some files have different logic |

> **Note:** `releases/v2` and `releases/v3` share the same codebase structure. Only a few major files have different implementations. The release process is identical for both.

---

## How Users Consume This Action

```yaml
# Users reference major version tag
- uses: Azure/webapps-deploy@v3   # Gets latest v3.x.x
- uses: Azure/webapps-deploy@v2   # Gets latest v2.x.x
```

---

## Release Workflow

### Step 1: Prepare Changes

**For v3 releases:**
1. Develop feature on feature branch
2. Merge PR to `master`
3. Create a feature branch from `releases/v3`:
   ```bash
   git checkout releases/v3
   git pull origin releases/v3
   git checkout -b feature/my-feature-v3
   ```
4. Cherry-pick commits from `master`:
   ```bash
   git cherry-pick <commit-hash>
   ```
5. Push and create PR to `releases/v3`:
   ```bash
   git push origin feature/my-feature-v3
   ```
6. Get PR reviewed and merge to `releases/v3`

**For v2 releases:**
1. Develop feature on feature branch
2. Merge PR to `master`
3. Create a feature branch from `releases/v2`:
   ```bash
   git checkout releases/v2
   git pull origin releases/v2
   git checkout -b feature/my-feature-v2
   ```
4. Cherry-pick commits from `master`:
   ```bash
   git cherry-pick <commit-hash>
   ```
5. Push and create PR to `releases/v2`:
   ```bash
   git push origin feature/my-feature-v2
   ```
6. Get PR reviewed and merge to `releases/v2`

> **Note:** Using feature branches allows for code review before changes land in release branches.

---

### Step 2: Create Release

1. Go to **GitHub → Releases → Create a new release**
2. Click **Choose a tag** → Type new tag (e.g., `v3.2.1`)
3. Select **Target branch**: Choose the corresponding release branch
   - `v3.x.x` → `releases/v3`
   - `v2.x.x` → `releases/v2`
4. Add release notes
5. Click **Publish release**

---

### Step 3: Two-Stage Approval & Release

When release is published, the workflow has **two approval stages**:

**Stage 1: Minor Tag (`release-minor` environment)**
1. Workflow shows changes in summary
2. Approver reviews and approves
3. Builds code and creates minor tag (e.g., `v3.2.1`)
4. Users can test with `Azure/webapps-deploy@v3.2.1`

**Stage 2: Major Tag (`release-major` environment)**
1. After testing minor tag, approver approves
2. Updates major tag (`v3`) to point to minor (`v3.2.1`)
3. Users on `Azure/webapps-deploy@v3` now get the new version

### One-time Setup

Go to **repo Settings → Environments** and create two environments:

1. **`release-minor`** - Required reviewers → Add your team
2. **`release-major`** - Required reviewers → Add your team

---

## What's Different from Before

| Aspect | Old Process | New Process |
|--------|-------------|-------------|
| `node_modules` | Committed to branch | ❌ Not needed (bundled with `ncc`) |
| Build artifacts | In release branch | In tag only (`dist/index.js`) |
| PR review | PR to releases/vX with node_modules | Review via workflow summary |
| Manual steps | npm install, npm build, push | Automated |
| Version tracking | Not tracked | Embedded in user agent |

---

## Rollback Procedure

### Quick Rollback (move v3 tag back)

```bash
# Point v3 back to previous version
git tag -fa v3 v3.2.0 -m "Rollback to v3.2.0"
git push origin v3 --force
```

### Hotfix Release

1. Fix the bug in `releases/v3` branch
2. Create new release `v3.2.2`
3. Workflow auto-updates `v3` tag

---

## Tag Naming Convention

| Tag | Description |
|-----|-------------|
| `v3.2.1` | Specific release version |
| `v3` | Always points to latest v3.x.x |
| `v2.1.5` | Specific v2 release |
| `v2` | Always points to latest v2.x.x |

---


## User Agent Tracking

API calls now include version information:

```
GITHUBACTIONS_DeployWebAppToAzure_v3.2.1_<repo_hash>
```

This helps track which release version is being used.

---

## Security

- Tag names are validated against pattern: `^v[0-9]+\.[0-9]+\.[0-9]+$`
- Only maintainers can create releases
- No secrets are exposed in the workflow

---

## Quick Reference

### Create a release (same for v2 and v3)
```
1. Create feature branch from releases/vX
2. Cherry-pick changes from master
3. Create PR to releases/vX → Review → Merge
4. Create release with tag vX.x.x → Publish
5. Approve Stage 1 (release-minor) → Creates v3.2.1
6. Test v3.2.1 if needed
7. Approve Stage 2 (release-major) → Updates v3
8. Done!
```

---

## Questions?

Contact the team or refer to the workflow file at `.github/workflows/release.yml`.
