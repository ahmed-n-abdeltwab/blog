---
layout: article
title: "Rocket.Chat Developer Guide"
date: 2026-02-18
modify_date: 2026-02-18
excerpt: "A practical guide for working with the Rocket.Chat monorepo. This isn't a comprehensive manual—it's a collection of workflows I use daily."
tags:
  [
    "Rocket.chat",
    "note",
    "git",
    "development",
  ]
key: rocket-chat-dev-guide
---


## Start

```bash
# Start development server
TEST_MODE=true yarn dsv
```

That's it. The dev server runs on `http://localhost:3000` with test mode on.

## Debugging & Testing

### Running API Tests

```bash
# Test all Chat endpoints
cd apps/meteor
yarn testapi -f '[Chat]'

# Test specific endpoint
yarn testapi -f 'should create a direct message'

# Run all API tests
yarn testapi
```

### Node.js Debugging

```bash
cd apps/meteor
yarn debug-brk
```

Then open Chrome DevTools at `chrome://inspect`. The `--brk` flag pauses execution at the first line, giving you time to set breakpoints.

### End-to-End Tests

```bash
# Run all E2E tests
yarn test:e2e

# Run specific test file
yarn test:e2e --grep "direct-message"

# Run federation tests
yarn test:e2e:federation
```

## Git Workflow

### Safe Reset Patterns

Here's how I recover when I mess up my local branches:

```bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, keep changes unstaged
git reset HEAD~1

# Reset to match develop branch
git reset --soft develop
```

### Cleaning Up

```bash
# Remove untracked files and directories
git clean -xdf

# Preview what will be deleted (safe)
git clean -xdfn
```

The `-x` flag removes ignored files (like `node_modules`). Use it when your build is broken and you want a fresh start.

### Force Push

```bash
# Safer than --force
git push --force-with-lease
```

## Formatting & Linting

### Auto-Fix Everything

```bash
# Fix ESLint issues
yarn eslint:fix

# Fix Stylelint issues
yarn stylelint:fix

# Run all linters (no auto-fix)
yarn lint
```

### Linting Specific Files

```bash
cd apps/meteor
yarn eslint --fix app/api/server/v1/subscriptions.ts
```

### Environment Variables

Key variables I set frequently:

```bash
# Enable test mode
TEST_MODE=true

# Enable debug logging
export LOG_LEVEL=debug
```

## Testing

### Unit Tests

```bash
# Run all unit tests with coverage
yarn testunit

# Run tests in watch mode
yarn testunit-watch

# Run specific test file
cd apps/meteor
yarn jest server/methods/createDirectMessage.spec.ts
```

### Test Organization

1. **Unit tests**: `*.spec.ts` files next to source code
2. **API tests**: `tests/end-to-end/api/` directory
3. **E2E tests**: `tests/end-to-end/` directory


## Common Issues

### Build Failures

```bash
# Clear Turbo cache
rm -rf .turbo

# Clear all node_modules
yarn clean
yarn install
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker-compose -f docker-compose-local.yml restart mongo
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Resources

- [Contributing Guide](https://github.com/RocketChat/Rocket.Chat/blob/develop/.github/CONTRIBUTING.md)
- [API Documentation](https://developer.rocket.chat/reference/api)
- [Turbo Documentation](https://turbo.build/repo/docs)

---

This guide reflects my workflow. Your mileage may vary.
