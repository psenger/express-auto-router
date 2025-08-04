# NPM Package Deployment Workflow

- [Prerequisites](#prerequisites)
- [Branch Strategy](#branch-strategy)
- [Development Workflow](#development-workflow)
  * [Phase 0: Feature Development](#phase-0-feature-development)
- [Deployment Process](#deployment-process)
  * [Phase 1: Prepare Release on Development](#phase-1-prepare-release-on-development)
  * [Phase 2: Promote to Main/Production](#phase-2-promote-to-mainproduction)
  * [Phase 3: Publish to NPM](#phase-3-publish-to-npm)
  * [Phase 4: Sync Branches](#phase-4-sync-branches)
- [Important Notes](#important-notes)
  * [GitHub Pages Setup](#github-pages-setup)
  * [Version Strategy](#version-strategy)
  * [Pre-release Checklist](#pre-release-checklist)
  * [Rollback Process](#rollback-process)
  * [First Release](#first-release)
- [Troubleshooting](#troubleshooting)
  * [Common Issues](#common-issues)
  * [Validation Commands](#validation-commands)
  * [Version Bump Caveats](#version-bump-caveats)
- [How CHANGELOG Generation Works](#how-changelog-generation-works)
  * [Conventional Commits Format](#conventional-commits-format)
  * [Commit Types and CHANGELOG Sections](#commit-types-and-changelog-sections)
  * [Breaking Changes](#breaking-changes)
  * [Examples](#examples)
  * [Customizing CHANGELOG Generation](#customizing-changelog-generation)

## Prerequisites
- Install npmrc for managing NPM identities: `npm i npmrc -g`
- Create and switch to public profile:
  ```bash
  npmrc -c public
  npmrc public
  ```

## Branch Strategy
- `main` - Production branch, tagged releases, source for NPM
- `dev` - Integration branch for features
- `feature/*` or `bugfix/*` - Individual work branches (where * is the ticket/issue number or descriptive name)
- `publish` - Dedicated branch for GitHub Pages documentation

## Development Workflow

### Phase 0: Feature Development
1. **Create ticket/issue** in your project management system (GitHub Issues, Jira, etc.) follow the instructions in [CONTRIBUTING](./CONTRIBUTING.md)

2. **Create feature branch from dev**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/TICKET-123-add-new-api
   # or
   git checkout -b bugfix/TICKET-456-fix-memory-leak
   ```

3. **Develop and commit changes**
   - refer to [Commit Types and CHANGELOG Sections](#commit-types-and-changelog-sections) for suitable prefix values, in this example we use  `feat:`
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: add new API endpoint (TICKET-123)"
   # Follow conventional commits for CHANGELOG generation
   ```

4. **Keep branch updated with dev**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout feature/TICKET-123-add-new-api
   git merge dev
   ```

5. **Create Pull Request to dev**
  - Push feature branch: `git push origin feature/TICKET-123-add-new-api`
  - Create PR from feature branch to dev
  - Link PR to ticket/issue
  - Request review
  - Ensure CI passes

## Deployment Process

### Phase 1: Prepare Release on Dev Branch
1. **Merge all approved PRs to `dev`**
  - Review and approve PRs
  - Merge PRs (squash or merge commits based on your strategy)
  - Delete feature branches after merge

2. **Pull latest dev and run full test suite**
   ```bash
   git checkout dev
   git pull origin dev

   # Run complete test suite
   npm install
   npm run build
   npm run test:coverage
   npm run test:lint

   # Test CommonJS integration
   cd test/integration-cjs
   npm install
   npm run test
   cd ../..

   # Test ESM integration
   cd test/integration-esm
   npm install
   npm run test
   cd ../..
   ```

3. **Preview and validate the release (DRY RUN)**
   ```bash
   # Still on dev branch
   # Preview what will happen without making changes
   npm run release -- --release-as major --dry-run
   # or for minor/patch:
   npm run release -- --release-as minor --dry-run
   npm run release -- --release-as patch --dry-run
   ```

   **Review the dry run output for:**
   - Correct version bump (e.g., 1.5.3 → 2.0.0 for major)
   - All expected commits appear in CHANGELOG sections
   - Breaking changes are properly highlighted
   - No commits are missing or miscategorized

   **Common issues to check:**
   - Missing commits? Check commit format: `git log --oneline -10`
   - Wrong section? Verify commit type: `feat:`, `fix:`, etc.
   - Breaking changes not showing? Ensure `BREAKING CHANGE:` or `!` is used
   - Unexpected version? You might have unreleased tags: `git tag -l`
   - Version in README doesn't match package.json? Rebuild after bump

4. **Execute the actual version bump**
   ```bash
   # Still on dev branch - this is where version bumping happens
   # After validating with dry run, run without --dry-run
   npm run release -- --release-as major

   # For minor release (new features):
   npm run release -- --release-as minor

   # For patch release (bug fixes):
   npm run release -- --release-as patch
   ```
   This updates: `package.json`, `package-lock.json`, `CHANGELOG.md`, and creates a git tag

4. **Rebuild documentation with new version**
   - it is important to do this after the version has been bumped
   ```bash
   npm run build:readme
   npm run build:github-docs
   ```

5. **Commit version bump and updated docs**
   ```bash
   git add .
   git commit -m "chore: release v$(node -p "require('./package.json').version")"
   ```

6. **Push development with tags**
   ```bash
   git push origin dev --follow-tags
   ```

### Phase 2: Promote to Main/Production
1. **Create Pull Request from development to main**
  - Review changes
  - Ensure CI/CD passes
  - Merge PR (do NOT squash to preserve commit history)

2. **Switch to main and verify**
   ```bash
   git checkout main
   git pull origin main
   ```

3. **Final validation on main**
   ```bash
   npm ci  # Clean install
   npm run build
   npm run test:coverage
   npm run test:lint
   ```

### Phase 3: Publish to NPM
1. **Ensure you're on the correct NPM profile**
   ```bash
   npmrc public
   npm whoami  # Verify correct user
   ```

2. **Publish to NPM**
   ```bash
   npm publish --access public
   ```

3. **Create GitHub Release**
  - Go to GitHub releases page
  - Create release from the tag
  - Copy relevant CHANGELOG entries
  - Attach any build artifacts if needed

### Phase 4: Sync Branches
1. **Back-merge main to dev**
   ```bash
   git checkout dev
   git pull origin dev
   git merge origin/main
   git push origin dev
   ```

2. **Update GitHub Pages documentation on publish branch**
   ```bash
   git checkout publish
   git pull origin publish
   git merge origin/main
   git push origin publish
   ```
   Note: GitHub Pages will automatically rebuild from the `publish` branch

3. **Clean up old feature branches**
   ```bash
   # Delete merged local branches
   git branch --merged | grep -v "\*\|main\|dev\|publish" | xargs -n 1 git branch -d

   # Delete remote branches (be careful!)
   # List them first:
   git branch -r --merged | grep -v "main\|dev\|publish"
   ```

## Important Notes

### GitHub Pages Setup
The `publish` branch is configured as the source for GitHub Pages:
- Contains the built documentation from `npm run build:github-docs`
- Updates automatically when you push to the `publish` branch
- Typically configured in repo Settings → Pages → Source: Deploy from branch → `publish`
- The docs are available at: `https://yourusername.github.io/yourrepo/`

### Version Strategy
- **Major** (x.0.0): Breaking API changes
- **Minor** (1.x.0): New features, backwards compatible
- **Patch** (1.0.x): Bug fixes, backwards compatible

### Pre-release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Dry run executed and CHANGELOG preview reviewed
- [ ] Version bump is appropriate for changes (major/minor/patch)
- [ ] CHANGELOG.md entries are accurate and complete
- [ ] Breaking changes clearly documented (for major releases)
- [ ] All commits follow conventional format
- [ ] No unreleased tags interfering with version
- [ ] Peer review completed
- [ ] Version bump makes sense for the changes

### Rollback Process
If something goes wrong after publishing:
1. `npm unpublish <package>@<version>` (within 72 hours)
2. Revert the merge commit on main
3. Fix the issue on dev
4. Start the release process again with a new patch version

### First Release
For the very first release:
```bash
npm run release -- --first-release
```

## Troubleshooting

### Common Issues
1. **"Working directory not clean"** - Commit or stash changes before release
2. **"Tag already exists"** - You may need to delete the tag: `git tag -d v1.0.0 && git push origin :v1.0.0`
3. **"npm ERR! 403"** - Check NPM authentication: `npm whoami`
4. **Version mismatch** - Ensure package-lock.json is updated: `npm install`

### Validation Commands
```bash
# Check what will be published
npm pack --dry-run

# Check package size
npm pack --dry-run 2>&1 | grep "npm notice package size"

# Verify package contents
tar -tzf $(npm pack)

# Preview commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Check for conventional commit format
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%s" | grep -E "^(feat|fix|perf|revert)(\(.+\))?:"

# Find commits that might be missing from CHANGELOG
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%s" | grep -v -E "^(feat|fix|perf|revert|chore|docs|style|refactor|test|build|ci)(\(.+\))?:"
```

### Version Bump Caveats

1. **Version conflicts**: If you get unexpected version numbers in dry run:
   ```bash
   # Check for existing tags
   git tag -l | sort -V

   # Check current package.json version
   npm pkg get version

   # Remove local tags if needed (careful!)
   git tag -d v2.0.0
```

2. **Pre-release versions**: If you previously used pre-release versions:
   ```bash
   # Going from 2.0.0-beta.1 to 2.0.0
   npm run release -- --release-as 2.0.0
   ```

3. **Skipping versions**: The tool won't let you skip versions normally:
   ```bash
   # Can't go from 1.0.0 to 3.0.0 directly
   # Use explicit version if absolutely needed:
   npm run release -- --release-as 3.0.0
   ```

4. **Wrong commits in CHANGELOG**: Common causes:
   - Typos in commit type: `feat:` not `feature:` or `Feat:`
   - Missing colon: `feat add feature` should be `feat: add feature`
   - Non-conventional commits from before adopting the standard

## How CHANGELOG Generation Works

The `npm run release` command uses **standard-version** (or **release-it**) which automatically generates the CHANGELOG based on your commit messages.

### Conventional Commits Format
Your commits must follow the Conventional Commits specification:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types and CHANGELOG Sections
- `feat:` → Features section
- `fix:` → Bug Fixes section
- `perf:` → Performance Improvements
- `revert:` → Reverts
- `docs:` → Documentation (usually not included)
- `style:` → Code style (usually not included)
- `refactor:` → Code refactoring (usually not included)
- `test:` → Tests (usually not included)
- `build:` → Build system (usually not included)
- `ci:` → CI configuration (usually not included)
- `chore:` → Chores (usually not included)

### Breaking Changes
Add `BREAKING CHANGE:` in the commit body or use `!` after the type:
```bash
feat!: remove deprecated API endpoint

BREAKING CHANGE: The /api/v1/users endpoint has been removed.
Use /api/v2/users instead.
```

### Examples
```bash
# Feature - goes in CHANGELOG
git commit -m "feat: add user authentication module"

# Bug fix - goes in CHANGELOG
git commit -m "fix: resolve memory leak in data processor"

# Feature with scope
git commit -m "feat(api): add pagination to GET /users endpoint"

# Breaking change - highlighted in CHANGELOG
git commit -m "feat!: change API response format

BREAKING CHANGE: API now returns data in 'results' field instead of root level"

# Won't appear in CHANGELOG
git commit -m "chore: update dependencies"
git commit -m "docs: improve README examples"
```

### Customizing CHANGELOG Generation
If you need to customize how the CHANGELOG is generated, create a `.versionrc` or `.versionrc.json` file:
```json
{
  "types": [
    {"type": "feat", "section": "Features"},
    {"type": "fix", "section": "Bug Fixes"},
    {"type": "perf", "section": "Performance Improvements"},
    {"type": "docs", "section": "Documentation", "hidden": false}
  ],
  "commitUrlFormat": "https://github.com/yourusername/yourrepo/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/yourusername/yourrepo/compare/{{previousTag}}...{{currentTag}}"
}
```
