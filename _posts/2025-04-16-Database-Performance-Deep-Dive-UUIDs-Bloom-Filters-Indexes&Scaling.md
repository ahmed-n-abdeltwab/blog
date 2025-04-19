---
layout: article
title: "Database Performance Deep Dive: UUIDs, Bloom Filters, Indexes & Scaling"
date: 2025-04-16
modify_date: 2025-04-16
excerpt: "Lecture notes covering UUID impacts on B+Trees, Bloom filters, SQL Server index design, billion-row table strategies, and transaction costs."
tags: [Database, UUID, BloomFilters, Indexes, Transactions, Performance, LectureNotes]
mathjax: false
key: database-lecture-notes
---

# Database Performance Deep Dive

## Bloom Filters

### Introduction
A memory-efficient probabilistic structure for checking element existence.

### Core Concepts
- **Bit Array**: Stores hashed values (e.g., 64-bit).
- **Hash Functions**: Map elements to bit positions (e.g., `hash("Paul") % 64 = 3`).

### Key Characteristics
- **Guarantees**:
  - **No false negatives**: Unset bit = element definitely absent.
  - **Possible false positives**: Set bit = element *might* exist.
- **Use Cases**:
  - Avoid expensive DB checks (e.g., "Does username exist?").
  - Used in Cassandra for consistent hashing.

### Implementation Steps
1. Initialize a bit array (e.g., 64 bits).
2. For insertion: Hash the element and set corresponding bits.
3. For queries: Check if all hashed bits are set.

### Limitations
- Bits fill up over time, leading to more false positives.
- Requires tuning (size, hash functions) for accuracy.

---

## Working with Billion-Row Tables

### Introduction
Strategies to manage extremely large tables.

### Core Strategies
1. **Brute Force**: Parallel processing (MapReduce).
2. **Indexing**: Reduce search space via B-trees.
3. **Partitioning**: Split tables horizontally (e.g., by user ID range).
4. **Sharding**: Distribute partitions across machines.
5. **Schema Redesign**: Avoid large tables (e.g., store JSON arrays).

### Example: Twitter Followers
- **Original Design**: `followers` table with billions of rows.
- **Optimized Design**: Store follower lists as JSON in user profiles.

### Trade-offs
- Sharding improves scalability but complicates transactions.
- Partitioning requires careful key selection.

---

## How UUIDs in B+Tree Indexes Affect Performance

### Introduction
Explores the performance challenges of using random UUIDs (version 4) in database indexes, particularly B+Tree structures.

### Core Concepts
- **UUIDv4**: 128-bit random identifiers with no inherent order.
- **B+Tree Indexes**: Ordered data structures where leaf nodes store data pages.

### Key Characteristics
- **Page Splits**:
  - Random inserts force frequent splits in B+Tree leaf nodes.
  - Example: Inserting `80` between `10` and `90` splits the page, increasing I/O.
- **Buffer Pool Thrashing**:
  - Random access patterns overload shared memory buffers, causing frequent cache evictions.
- **Shopify’s Solution**:
  - Switched to **ULID** (time-ordered UUIDs) for sequential inserts, reducing splits.

### Advantages & Disadvantages

| **Random UUIDs** | **Ordered UUIDs (ULID)** |
|------------------|--------------------------|
| ✔️ Globally unique | ✔️ Reduced page splits |
| ❌ High write latency | ❌ Less random uniqueness |

### Practical Example
```sql
-- Problematic UUIDv4 usage in MySQL
CREATE TABLE orders (
    id BINARY(16) PRIMARY KEY, -- Random UUID
    ...
);
```

### Conclusion
Use ordered IDs (e.g., ULID) for high-write tables to minimize splits and buffer churn.

---

## The Cost of Long-Running Transactions

### Introduction
Impact of failed long transactions in PostgreSQL.

### Core Concepts
- **Row Versioning**: Updates create new row versions; indexes must update.
- **HOT (Heap Only Tuples)**: Bypasses index updates if page has space.

### Key Issues
- **Dead Rows**: Rollbacks leave invalid rows, requiring `VACUUM`.
- **I/O Overhead**: Pages with few live rows waste disk reads.

### Cleanup Approaches

| **Eager (Undo Logs)** | **Lazy (PostgreSQL VACUUM)** |
|------------------------|------------------------------|
| ✔️ Immediate cleanup | ✔️ Non-blocking |
| ❌ Slows rollbacks | ❌ Delayed resource reuse |

### Conclusion
Monitor long transactions and tune `VACUUM` frequency to balance performance.

---

## Microsoft SQL Server Clustered Index Design

### Introduction
Differences between clustered and nonclustered indexes in SQL Server.

### Core Concepts
- **Clustered Index**:
  - Leaf nodes = data pages; determines physical row order.
  - One per table.
- **Nonclustered Index**:
  - Leaf nodes = index pages with pointers (RID or clustered keys).

### Key Characteristics

| **Clustered Index** | **Nonclustered Index** |
|----------------------|------------------------|
| ✔️ Faster reads for range queries | ✔️ Multiple per table |
| ❌ Costly updates | ❌ Extra lookup for data |

### Partitioning
- Splits indexes into multiple B-trees (e.g., by date ranges).
- Example: A 4-partition index has 4 separate B-trees.

---

**Final Takeaways**  
- Ordered UUIDs and Bloom filters optimize writes and checks.  
- Indexes and partitioning are critical for scaling.  
- Transaction design affects both performance and maintenance.  

