---
layout: article
title: "Understanding Memcached: Architecture and Key Concepts"
date: 2025-05-17
modify_date: 2025-05-17
excerpt: "A deep dive into Memcached's architecture, covering memory management, threading, LRU, and more."
tags: ["Memcached", "In-Memory Database", "Caching", "Architecture", "LectureNotes"]
mathjax: false
mathjax_autoNumber: false
key: "memcached-architecture"
---

# Understanding Memcached: Architecture and Key Concepts

**Introduction**  
Slow database queries or heavy computations can frustrate developers and users alike. Is caching the answer? This lecture explores **Memcached**, a simple in-memory key-value store used by big names like Facebook and Netflix. We’ll look at its architecture, how it works, and why it’s built this way. The key takeaway? *Memcached’s power comes from its simplicity, but that simplicity has limits we need to understand.*

**Core Concepts/Overview**  
**Memcached** is an in-memory key-value store designed for caching. It keeps data in memory for quick access but doesn’t save it to disk. It’s basic—no fancy features like persistence or complex data types. Even its distributed setup relies on the client, not the server. This keeps it fast and easy to use.

**Key Characteristics**  

- **Memory Management**  
  Memcached grabs memory in 1 MB pages to avoid **fragmentation**—wasted gaps in memory. Pages split into fixed-size chunks based on **slab classes**. Each item (key, value, metadata) fits into a chunk. If a slab class is full, Memcached adds a new page. This keeps memory tidy and efficient.

- **Threading**  
  A **listener thread** handles incoming connections on port 11211 (TCP). It passes them to **worker threads**, which manage reads and writes. Threading helps Memcached handle many clients at once, especially for tasks like hashing or updating the LRU.

- **LRU (Least Recently Used)**  
  When memory fills up, Memcached uses **LRU** to remove old items. Each slab class has its own LRU list. Used items move to the top; unused ones drop off the bottom. The lecturer thinks LRU should be optional—it adds complexity.

- **Read/Writes**  
  - *Reads:* Hash the key, find it in the **hash table**, grab the item, update LRU.  
  - *Writes:* Hash the key, find or make a slot, pick a chunk, store the item. Simple but fast.

- **Collisions**  
  If two keys hash to the same spot, Memcached chains them together. Long chains slow reads, so it might resize the hash table to fix this.

- **Distributed Cache**  
  Memcached servers don’t talk to each other—clients split the keys across them. This keeps the design clean and simple.

**Advantages & Disadvantages**  

- **Advantages**  
  - *Simplicity:* Easy to set up and use.  
  - *Speed:* Super fast for cached data.  
  - *Scalability:* Add more servers as needed.  

- **Disadvantages**  
  - *No persistence:* Data disappears on restart.  
  - *Size limit:* Values capped at 1 MB.  
  - *LRU cost:* Can slow things down.  
  - *Client work:* Clients handle distribution.

**Practical Implementations/Examples**  
The lecture demoed Memcached with:  
1. **Docker:** Spin up instances (e.g., `docker run --name mem1 -p 11211:11211 -d memcached`).  
2. **Telnet:** Set and get keys (e.g., `set foo 0 3600 2`, then `get foo`).  
3. **Node.js:** A client spreads keys across servers:  
   ```javascript
   const MEMCACHED = require("memcached");
   const serverPool = new MEMCACHED(["hostname:11211", "hostname:11212"]);
   serverPool.set("foo1", "bar1", 3600, err => console.log(err));
   ```
   This shows how clients manage the distributed cache.

**Conclusion**  
Memcached is a fast, simple caching tool, but it’s not perfect. Its architecture—memory pages, threading, LRU—makes it powerful yet limited. I like how it forces you to think about performance first, not just slap a cache on everything. It’s a solid choice when other fixes fail, but you’ve got to plan for its quirks.
