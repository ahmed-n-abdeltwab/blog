---
layout: article
title: "Understanding Memcached Architecture"
date: 2025-05-18
modify_date: 2025-05-18
excerpt: "This lecture explores the architecture of Memcached, an in-memory key-value store, covering its memory management, threading model, and distributed nature."
tags: [Memcached, Caching, Database, Architecture, LectureNotes]
mathjax: false
mathjax_autoNumber: false
key: memcached-architecture
---

# Understanding Memcached Architecture

## Introduction

Databases can slow down when they get too many queries, making applications lag. This is a real pain point for developers. Memcached is a solution—a simple caching tool created in 2003 to ease the load on databases. Big companies like Facebook and Netflix use it to manage huge amounts of data fast. This lecture explains Memcached’s architecture, focusing on how it handles memory, uses threads, and works as a distributed system. The big revelation? Its simplicity makes it fast but also limits what it can do.

## Core Concepts/Overview

Memcached is an **in-memory key-value store**, meaning it keeps data in RAM for quick access. It’s written in C and uses a basic system: you give it a **key** (a string) and a **value** (any data type). Here’s how it works under the hood:

### Memory Management
Memcached avoids memory mess (*fragmentation*) by organizing data smartly:
- **Pages**: It grabs memory in 1MB chunks called pages.
- **Slabs**: Pages are split into slabs based on size classes (e.g., 72 bytes or 1MB).
- **Chunks**: Each slab divides into fixed-size chunks where data fits.

This keeps memory tidy but wastes a bit of space if data doesn’t fill a chunk perfectly.

### LRU Mechanism
When memory fills up, Memcached uses **LRU** (Least Recently Used) to kick out old data:
- Each slab class has its own LRU list.
- Items not used lately get removed first.
- *The lecturer thinks this might be too much work for what it does.*

### Threading Model
Memcached handles many users at once with threads:
- A main thread listens for connections (port 11211).
- Each connection gets its own thread to process requests.
- This speeds things up but needs locks to avoid clashes.

### Locking Model
Threads need rules to share data:
- Old way: One big lock slowed everything down.
- New way: Locks per item, so only same-item access waits.

### Distributed Nature
Memcached isn’t truly distributed—it’s up to the client:
- Each Memcached server runs alone, unaware of others.
- Clients decide where to send keys using tricks like **consistent hashing**.

## Key Characteristics

- **Simple**: In-memory key-value store.
- **Keys**: Strings, max 250 characters.
- **Values**: Any type, max 1MB by default.
- **Memory**: Uses slabs to avoid fragmentation.
- **Eviction**: LRU removes unused items.
- **Threads**: Multi-threaded for many users.
- **Locks**: Per-item to manage access.
- **Distribution**: Client-side, not server-side.

## Advantages & Disadvantages

### Advantages
- **Fast**: RAM storage means quick reads and writes.
- **Simple**: Easy to set up and use.
- **Scalable**: Add more servers to grow.
- **Helps Databases**: Caches queries to lighten the load.

### Disadvantages
- **No Persistence**: Data vanishes if the server restarts.
- **Size Limit**: Values capped at 1MB.
- **No Security**: No built-in protection (e.g., passwords).
- **Client Work**: Clients handle all distribution logic.

## Practical Implementations/Examples

The lecture showed how to use Memcached with Docker and code:

1. **Run Memcached in Docker**:
   ```bash
   docker run -d --name m1 -p 11211:11211 memcached
   ```
   Start more instances on ports like 11212, 11213.

2. **Test with Telnet**:
   - Connect: `telnet localhost 11211`
   - Set data: `set foo 0 3600 2\r\nhi\r\n`
   - Get data: `get foo`

3. **Node.js Example**:
   - Install: `npm install memcached`
   - Code to set a value:
     ```javascript
     const Memcached = require('memcached');
     const serverPool = new Memcached(['localhost:11211']);
     serverPool.set('foo', 'bar', 3600, (err) => { if (err) console.error(err); });
     ```
   - Code to get a value:
     ```javascript
     serverPool.get('foo', (err, data) => { console.log(data); });
     ```
   - Add more servers (e.g., `localhost:11212`) to distribute keys.

This shows how Memcached works in real apps, splitting data across servers.

## Conclusion

Memcached is a fast, simple caching tool that shines because it sticks to basics. Its architecture—memory slabs, LRU, threads, and client-side distribution—makes it great for speeding up apps. But it’s not perfect: no persistence, size limits, and extra client work are trade-offs. Knowing how it’s built helps me decide when to use it. *I like its simplicity, but I’d think twice if I need data to stick around.*
