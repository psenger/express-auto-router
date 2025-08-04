
Thanks for contributing! 😁 Here are some rules that will make your change to
Express-auto-router fruitful.

## Rules

- Raise a ticket to the feature or bug can be discussed
- Pull requests are welcome, but must be accompanied by a ticket approved by the repo owner
- You are expected to add a unit test or two to cover the proposed changes.
- Please run the tests and make sure tests are all passing before submitting your pull request
- Do as the Romans do and stick with existing whitespace and formatting conventions (i.e., tabs instead of spaces, etc)
  - we have provided the following: `.editorconfig` and `.eslintrc`
  - Don't tamper with or change `.editorconfig` and `.eslintrc`
- Please consider adding an example under examples/ that demonstrates any new functionality

## Commit Message

This module uses [release-please](https://github.com/googleapis/release-please) which
needs commit messages to look like the following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Basic Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**type** is typically `fix`, `feat`. When **type** ends with a `!` or includes `BREAKING CHANGE` in the body/footer, it indicates this is a breaking change.

**type** should be followed by a short description, **<description>**

**optional body** can have more detail

### Commit Types and CHANGELOG Impact

The following commit types will be grouped in the CHANGELOG:

| Type     | Description              | CHANGELOG Section        | Example                                       |
| -------- | ------------------------ | ------------------------ | --------------------------------------------- |
| `feat`   | New feature              | Features                 | `feat: add markdown table support`            |
| `fix`    | Bug fix                  | Bug Fixes                | `fix: resolve parsing error for nested lists` |
| `perf`   | Performance improvement  | Performance Improvements | `perf: optimize regex for faster parsing`     |
| `revert` | Revert a previous commit | Reverts                  | `revert: feat: add markdown table support`    |

The following types are valid but typically **excluded** from CHANGELOG:

- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

### Commit Examples

#### Features

```bash
# Simple feature
git commit -m "feat: add support for custom fence renderers"

# Feature with scope (include ticket if applicable)
git commit -m "feat(parser): add HTML5 output option (TICKET-123)"

# Feature with detailed body
git commit -m "feat: add plugin system for custom syntaxes" -m "- Support for registering custom parsers
- Add hooks for pre/post processing
- Include TypeScript definitions"
```

#### Bug Fixes

```bash
# Simple fix
git commit -m "fix: correct fence detection for indented blocks"

# Fix with scope and ticket
git commit -m "fix(lexer): handle edge case in nested fences (TICKET-456)"
```

#### Breaking Changes (for major releases)

```bash
# Method 1: Using ! after type
git commit -m "feat!: change API to use async/await pattern"

# Method 2: Using BREAKING CHANGE in body
git commit -m "feat: redesign parser API" -m "BREAKING CHANGE: parse() now returns a Promise instead of synchronous result.
Update all calls to use await or .then()"

# Method 3: Multi-line format
git commit -m "refactor: update configuration schema

BREAKING CHANGE: Config property 'enableLegacy' removed.
Use 'parserMode: \"legacy\"' instead.

Closes #789"
```

#### Other Types (won't appear in CHANGELOG)

```bash
# Documentation
git commit -m "docs: improve API documentation examples"

# Code style
git commit -m "style: apply eslint formatting rules"

# Tests
git commit -m "test: add edge cases for fence parsing"

# Build/Dependencies
git commit -m "build: update to webpack 5"
git commit -m "chore: bump dependencies"

# CI/CD
git commit -m "ci: add Node.js 20 to test matrix"
```

### Commit Message Best Practices

1. **First line** should be no more than 72 characters
2. **Use present tense** ("add feature" not "added feature")
3. **Use imperative mood** ("fix bug" not "fixes bug")
4. **Reference tickets** when applicable: `feat(TICKET-123): add feature` or include in body
5. **Be specific** - "fix: resolve memory leak in parser" is better than "fix: fix bug"

### What Makes a Good Commit Message

❌ **Bad:**

```
Added new feature
fix
Updated code
FEAT: ADD PARSER (wrong case)
feat - add parser (wrong separator)
```

✅ **Good:**

```
feat: add markdown table parsing support
fix: prevent infinite loop when parsing malformed fences
feat(parser): implement GFM-style strikethrough (TICKET-234)
fix!: correct fence regex to match spec

BREAKING CHANGE: Fences with spaces after opening backticks are no longer valid.
This aligns with CommonMark specification.
```

## Testing

- All tests are expected to work
- Tests are based off of `dist/index.js` **NOT** your src code. Therefore, you should BUILD it first.
- Coverage should not go down, and I acknowledge it is very difficult to get the tests to 100%

### Running Tests

```bash
# Build first
npm run build

# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run linting
npm run test:lint

# Run integration tests
cd test/integration-cjs && npm test
cd test/integration-esm && npm test
```
