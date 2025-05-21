---
layout: article
title: "How to Secure Your Postgres Database by Enabling TLS/SSL"
date: 2025-05-21
modify_date: 2025-05-21
excerpt: "This lecture explains how to set up a Postgres database with a secure TLS/SSL connection using Docker, connect to it with PgAdmin, and protect data in transit."
tags: ["Postgres", "Database Security", "TLS/SSL", "LectureNotes"]
mathjax: false
mathjax_autoNumber: false
key: "secure-postgres-tls-ssl"
---

# How to Secure Your Postgres Database by Enabling TLS/SSL

## Introduction

The lecture begins with a big problem: many people think database connections are safe by default. They assume no one can "listen in" because the database and client (like a web server) are close together. But in modern setups, like the cloud or Kubernetes, this isn’t true anymore. Data can be stolen if it’s not protected.

The goal of this lecture is to show how to make a **Postgres** database secure by using **TLS/SSL**. It covers:
- Starting a Postgres instance with Docker.
- Connecting to it using **PgAdmin**.
- Adding TLS/SSL to encrypt the connection.

The key idea is that we need to create a certificate and set up Postgres to use it. Without this, our data isn’t safe.

## Core Concepts/Overview

### What is TLS/SSL?

**TLS** (Transport Layer Security) and **SSL** (Secure Sockets Layer) are ways to make network communication safe. They encrypt data so no one can read it while it travels between the client and the database.

### Why Secure Database Connections?

In the past, databases and clients were on the same network, so encryption wasn’t a big worry. Now, with cloud systems, they can be far apart. This makes it easier for someone to intercept data. TLS/SSL keeps it private.

## Key Characteristics

### Spinning Up Postgres

We use Docker to start a Postgres instance:
- Command: `docker run --name pkg -p 5432:5432 postgres`
- This pulls the latest Postgres version (like version 12) and runs it on port 5432.

### Connecting via PgAdmin

To manage Postgres, we use **PgAdmin**, also in Docker:
- Command: `docker run -e PGADMIN_DEFAULT_EMAIL=hussein -e PGADMIN_DEFAULT_PASSWORD=password -p 5555:80 --name pgadmin dpage/pgadmin4`
- Open `localhost:5555` in a browser, log in with "hussein" and "password," and connect to Postgres (host: localhost, port: 5432, user: postgres).

By default, this connection is *unencrypted*. We’ll fix that next.

### Enabling SSL

To secure the connection:
1. **Bash into the Container:** `docker exec -it pkg bash`
2. **Install Vim:** `apt-get update && apt-get install vim`
3. **Edit Config:** Open `/var/lib/postgresql/data/postgresql.conf` and set `ssl = on`.
4. **Add Certificate Files:** We need a certificate (`cert.pem`) and private key (`private.pem`).
5. **Restart Postgres:** `docker stop pkg && docker start pkg`

Now, the connection can use SSL.

## Advantages & Disadvantages

### Advantages
- **Safe Data:** Encrypts data so it can’t be read by others.
- **Modern Need:** Essential for cloud setups.

### Disadvantages
- **Extra Work:** Takes more steps to set up.
- **Slight Delay:** Encryption might slow things down a little.

## Practical Implementations/Examples

### Generating a Certificate

We use OpenSSL to make a self-signed certificate:
- Command: `openssl req -new -x509 -newkey rsa:4096 -nodes -keyout private.pem -out cert.pem`
- Answer questions (e.g., country: US, state: California, server: localhost).
- This creates `cert.pem` and `private.pem`.

Next, set permissions:
- `chmod 600 private.pem` (makes it readable).
- `chown postgres private.pem` (matches the Postgres user).

### Configuring Postgres

In `postgresql.conf`, add:
- `ssl_cert_file = '/var/lib/postgresql/data/cert.pem'`
- `ssl_key_file = '/var/lib/postgresql/data/private.pem'`

Copy the files into the container and restart it.

### Verifying Connection

In PgAdmin:
- Go to connection settings.
- Set SSL mode to "Require."
- Connect. If it works, the connection is secure!

## Conclusion

This lecture shows how to protect a Postgres database with TLS/SSL. It’s super important in the cloud, where data can be at risk. We learned to:
- Start Postgres and PgAdmin with Docker.
- Make a certificate with OpenSSL.
- Turn on SSL in Postgres.
- Check that it works.

I like how practical this is. It’s a bit tricky, but it makes sense for keeping data safe.
