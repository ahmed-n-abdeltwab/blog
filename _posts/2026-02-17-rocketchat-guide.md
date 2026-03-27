---
layout: article
title: "My Rocket.Chat Developer Guide"
date: 2026-02-18
modify_date: 2026-03-27
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


## Running Development in a Podman Container

I didn't want to install Meteor, Node.js, and Deno directly on my machine — too much noise, and version conflicts are a headache. So I put together a `Dockerfile.dev` that handles all of that inside a container, with the project folder mounted from the host so edits are instant and nothing gets out of sync.

### Dockerfile.dev

```dockerfile
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# System dependencies
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    build-essential \
    ca-certificates \
    curl \
    git \
    jq \
    libssl-dev \
    python3 \
    sudo \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Create developer user with passwordless sudo
RUN useradd -m -s /bin/bash developer \
    && echo "developer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER developer
WORKDIR /home/developer

# Node.js 22.16.0 via NVM
ENV NODE_VERSION=22.16.0
ENV NVM_DIR=/home/developer/.nvm

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# Yarn 4.12.0 via corepack (needs root to write to system dirs)
USER root
RUN corepack enable
USER developer
RUN corepack prepare yarn@4.12.0 --activate

# Meteor 3.3.2
ENV PATH="/home/developer/.meteor:$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

RUN curl "https://install.meteor.com/?release=3.3.2" | sh

# Deno 2.3.1
ENV DENO_INSTALL=/home/developer/.deno
ENV PATH="$DENO_INSTALL/bin:$PATH"

RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=$DENO_INSTALL sh -s v2.3.1

# Persist env vars in shell
RUN echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc \
    && echo 'export PATH="$HOME/.meteor:$HOME/.deno/bin:$PATH"' >> ~/.bashrc

WORKDIR /workspace

EXPOSE 3000

CMD ["bash"]
```

The versions here aren't random — they're pulled straight from the project itself. Node 22.16.0 comes from `package.json` engines, Meteor 3.3.2 from `apps/meteor/.meteor/release`, and Deno 2.3.1 from `.tool-versions`. The `developer` user gets passwordless sudo so you're not fighting permissions mid-session, and `/workspace` is where the host folder lands.

### Building the image

If you're on Fedora or any RHEL-based distro, SELinux will block the build with a memory protection error unless you pass `--security-opt label=disable`. The tag mirrors the project version from `package.json`:

```bash
podman build --security-opt label=disable -f Dockerfile.dev -t localhost/rocket-chat-dev:8.4.0 .
```

### Running the container

A few things worth explaining here. `--network host` skips the virtual network entirely — the container shares your machine's network stack, so `localhost:3000` just works from your browser without any port mapping. `--userns=keep-id` is the important one for file permissions: it maps your host UID into the container, which means the mounted volume behaves exactly like it does on your host — no `EACCES` errors when Yarn tries to write to the cache. The `:Z` on the volume mount handles SELinux relabeling. And the memory and CPU limits keep the build from eating your whole machine:

```bash
podman run -it \
  --name rocketchat-dev \
  --network host \
  --userns=keep-id \
  --security-opt label=disable \
  --memory 12g \
  --cpus 4 \
  -v $(pwd):/workspace:Z \
  localhost/rocket-chat-dev:8.4.0 bash
```

### First time inside the container

```bash
cd /workspace
yarn          # install all dependencies
yarn install
yarn dev      # start the dev server
```

Then open `http://localhost:3000` on your host. The first `yarn` will take a while — it's pulling everything fresh.

---

## Starting the dev server

```bash
TEST_MODE=true yarn dsv
```

That's the one I use daily. Test mode on, dev server up, `http://localhost:3000` ready.

## Debugging & Testing

### API Tests

```bash
# Test all Chat endpoints
cd apps/meteor
yarn testapi -f '[Chat]'

# Test a specific case
yarn testapi -f 'should create a direct message'

# Run everything
yarn testapi
```

### Node.js Debugging

```bash
cd apps/meteor
yarn debug-brk
```

Open `chrome://inspect` in Chrome. The `--brk` flag holds execution at the first line so you have time to set breakpoints before anything runs.

### End-to-End Tests

```bash
# Full suite
yarn test:e2e

# Specific test
yarn test:e2e --grep "direct-message"

# Federation tests
yarn test:e2e:federation
```

## Git Workflow

### Undoing things without panicking

These are the three I reach for most:

```bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, keep changes unstaged
git reset HEAD~1

# Reset to match develop
git reset --soft develop
```

### Cleaning up a broken state

```bash
# Nuke untracked files and directories
git clean -xdf

# Preview first if you're not sure
git clean -xdfn
```

The `-x` flag is what removes ignored files like `node_modules`. When a build is acting weird and you can't figure out why, this usually fixes it.

### Pushing after a rebase

```bash
git push --force-with-lease
```

Safer than `--force` — it won't overwrite if someone else pushed to the branch since your last fetch.

## Formatting & Linting

```bash
# Fix ESLint issues
yarn eslint:fix

# Fix Stylelint issues
yarn stylelint:fix

# Check everything without fixing
yarn lint

# Fix a specific file
cd apps/meteor
yarn eslint --fix app/api/server/v1/subscriptions.ts
```

### Env variables I set often

```bash
TEST_MODE=true
export LOG_LEVEL=debug
```

## Testing

### Unit Tests

```bash
# Full run with coverage
yarn testunit

# Watch mode
yarn testunit-watch

# Single file
cd apps/meteor
yarn jest server/methods/createDirectMessage.spec.ts
```

### Where tests live

- Unit tests: `*.spec.ts` files sitting next to the source
- API tests: `tests/end-to-end/api/`
- E2E tests: `tests/end-to-end/`

## Common Issues

### Build is broken and nothing makes sense

```bash
rm -rf .turbo
yarn clean
yarn install
```

Clear the Turbo cache first, then reinstall. Fixes most weird build failures.

### MongoDB won't connect

```bash
# Check if it's running
docker ps | grep mongo

# Restart it
docker-compose -f docker-compose-local.yml restart mongo
```

### Port 3000 already in use

```bash
lsof -i :3000
kill -9 <PID>
```

## Resources

- [Contributing Guide](https://github.com/RocketChat/Rocket.Chat/blob/develop/.github/CONTRIBUTING.md)
- [API Documentation](https://developer.rocket.chat/reference/api)
- [Turbo Documentation](https://turbo.build/repo/docs)

---

This is my workflow, not a spec. Take what's useful.
