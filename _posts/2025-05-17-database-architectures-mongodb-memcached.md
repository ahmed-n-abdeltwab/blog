---
layout: article
title: "Database Architectures Unveiled: MongoDB and MemCached"
date: 2025-05-17
modify_date: 2025-05-17
excerpt: "A look into how MongoDB and MemCached work inside, focusing on their designs and how they help or limit performance."
tags: ["Database", "MongoDB", "MemCached", "Architecture", "Performance", "LectureNotes"]
mathjax: false
mathjax_autoNumber: false
key: "database-architectures-mongodb-memcached"
---

# Database Architectures Unveiled: MongoDB and MemCached

## Introduction

> "Picking the wrong database can slow down your app, and fixing it later is a headache."

As my apps grow, I notice the database often becomes the weak spot. This lecture showed me how **MongoDB** and **MemCached** work inside, explaining their designs and why they matter for speed and growth. It covered MongoDB’s changes over time, like its new clustered collections, and MemCached’s simple in-memory setup. The goal was to understand how they store and fetch data and how that affects performance. The big takeaway? *Even though they’re different, both use basic database ideas like indexes and memory tricks to do their job.*

## Core Concepts/Overview

This lecture dug into two database systems:

- **MongoDB**: A NoSQL database that stores data as **documents** in collections. It’s evolved from MMAPV1 to WiredTiger and now has clustered collections.
- **MemCached**: An in-memory key-value store for caching, keeping things fast and simple by avoiding fancy features like persistence.

MongoDB focuses on flexibility and handling complex data, while MemCached is all about quick caching for costly operations.

## Key Characteristics

### MongoDB Internals
- **Storage Evolution**:
  - *MMAPV1*: Used memory-mapped files with a global lock. Updates messed up offsets, slowing things down.
  - *WiredTiger*: Added document-level locking and compression. Stores data in a hidden index with **recordId**.
- **Clustered Collections** (MongoDB 5.3):
  - The **_id** index now holds the whole document, no hidden index needed.
  - Faster lookups on **_id**, but secondary indexes point to **_id** instead of **recordId**.

### MemCached Architecture
- **Memory Management**:
  - Pre-allocates 1MB pages split into chunks (**slab classes**) to avoid fragmentation.
  - Items fit into the smallest chunk possible, like 72 bytes or 1MB.
- **Threading**:
  - A listener thread hands connections to worker threads for better handling of many users.
- **LRU Cache**:
  - Removes least-used items when memory’s full, using a linked list per slab class.
- **Distributed Cache**:
  - Clients decide where keys go; servers don’t talk to each other.

## Advantages & Disadvantages

### MongoDB
- **Advantages**:
  - Flexible with no fixed schema—great for changing data.
  - Clustered collections speed up **_id** queries and save space.
- **Disadvantages**:
  - Secondary indexes get bigger with clustered collections (12 bytes+ vs. 8 bytes).
  - Can’t add clustered indexes to old collections; you need to start fresh.

### MemCached
- **Advantages**:
  - Super simple and fast for caching slow queries or results.
  - Easy to scale by adding more servers.
- **Disadvantages**:
  - Only in-memory, no saving to disk, so data can vanish.
  - Clients handle distribution, which adds work for developers.

## Practical Implementations/Examples

- **MongoDB Clustered Collection**:
  - Create it with: `db.createCollection("myColl", { clusteredIndex: { key: { _id: 1 }, unique: true } })`.
  - Good for fast **_id** lookups or range queries.
- **MemCached with Node.js**:
  - Set up multiple servers: `docker run --name mem1 -p 11211:11211 -d memcached`.
  - Use Node.js client to spread keys: `new MEMCACHED(["host:11211", "host:11212"])`.
  - Example: `serverPool.set("foo1", "bar1", 3600, err => console.log(err))`.

## Conclusion

This lecture made me see how MongoDB and MemCached tackle performance in their own ways. MongoDB’s updates, like clustered collections, make it better for big, flexible data, while MemCached keeps caching dead simple. *I wonder how much those bigger secondary indexes in MongoDB slow things down in real apps.* For MemCached, leaving distribution to the client is clever but feels like extra homework. Knowing these insides helps me pick the right tool later—MongoDB for complex storage, MemCached for quick boosts.
