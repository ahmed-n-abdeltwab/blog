---
layout: article
title: "Database Sharding and Consistent Hashing Explained"
date: 2025-04-28
modify_date: 2025-04-28
excerpt: "A deep dive into database sharding, consistent hashing, and their practical implementation using Postgres and NodeJS."
tags: ["Database Sharding", "Consistent Hashing", "Horizontal Partitioning", "Scalability", "LectureNotes"]
mathjax: true
mathjax_autoNumber: true
key: "sharding-consistent-hashing"
---

# Database Sharding and Consistent Hashing

## Introduction
**Pain Point:** Imagine your database queries slowing to a crawl as your table grows to millions of rows. Indexes bloat, writes bottleneck, and scaling vertically becomes prohibitively expensive. This is where **sharding** steps in as a last-resort solution.  

**Overview:**  
This lecture covers database sharding, a technique to horizontally split data across multiple servers. Key topics include **consistent hashing**, differences between **horizontal partitioning** and sharding, and a hands-on example using Postgres and NodeJS.  

**Real-World Failure Story:** YouTube initially relied on a single MySQL server but faced crippling write loads as it scaled. They adopted application-level sharding, later transitioning to **Vitess**, a middleware that automates sharding logic.  

**Key Revelation:** *Sharding introduces significant complexity and should only be considered after exhausting other optimizations like caching, replication, and partitioning.*

---

## Core Concepts

### What is Sharding?
- **Sharding** splits a large table into smaller chunks (**shards**) distributed across multiple database instances.  
- Each shard has the same schema but holds a subset of data.  
- **Partition key** (e.g., URL ID) determines which shard stores a record.  

### Consistent Hashing
- Maps data to servers using a hash function (e.g., `hash(input) % number_of_shards`).  
- Ensures the same input always routes to the same server, enabling predictable scaling.  
- Example: `hash("input1")` → Server 5432, `hash("input2")` → Server 5433.  

### Horizontal Partitioning vs Sharding

| **Horizontal Partitioning**       | **Sharding**                          |
|------------------------------------|---------------------------------------|
| Splits data into tables within the same database. | Splits data across multiple databases. |
| Client knows partition names (e.g., `customers_west`). | Client uses consistent hashing to locate shards. |

---

## Key Characteristics

### Scalability
- Distributes data **and** load (CPU, memory) across servers.  
- Enables horizontal scaling for high-traffic systems.  

### Security
- Restrict access to specific shards (e.g., VIP customer data on a secure shard).  

### Index Optimization
- Smaller indexes per shard → faster queries.  

---

## Advantages & Disadvantages

**Pros**  
1. **Scalability:** Handle larger datasets and higher traffic.  
2. **Fault Isolation:** A failing shard doesn’t crash the entire system.  
3. **Security:** Fine-grained access control per shard.  

**Cons**  
1. **Complex Clients:** Clients must know sharding logic.  
2. **No Cross-Shard Transactions:** Atomic commits across shards are nearly impossible.  
3. **Schema Changes:** Altering tables requires updating all shards.  
4. **Joins and Queries:** Queries without partition keys must scan all shards.  

---

## Practical Implementation

### Spin Up Postgres Shards with Docker
1. Create an `init.sql` script to define the table schema.  
2. Build a custom Docker image to auto-run the script on startup.  
3. Launch three Postgres instances on ports 5432, 5433, and 5434.  

### NodeJS Example (URL Shortener)
- **Consistent Hashing:** Use `hashring` library to map URLs to shards.  
- **Write Flow:**  
  ```javascript
  const hash = crypto.createHash('sha256').update(url).digest('base64');
  const urlId = hash.substring(0, 5);
  const serverPort = hashring.get(urlId);
  await clients[serverPort].query('INSERT INTO url_table VALUES ($1, $2)', [url, urlId]);
  ```
- **Read Flow:** Hash the URL ID to find the correct shard, then query it.  

---

## Conclusion
- **Sharding** is powerful but complex. Use it only after optimizing caching, replication, and partitioning.  
- **Consistent hashing** ensures data is evenly and predictably distributed.  
- *Transactions and joins remain major challenges in sharded systems.*  

> **Lecture Highlight:**  
> *"Sharding makes you sound smart, but it’s the last thing you want to do. Exhaust all other options first."*
