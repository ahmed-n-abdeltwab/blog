---
layout: article
title: "B+ Trees vs B-Trees: How Database Indexing Really Works"
date: 2025-04-19
modify_date: 2025-04-19
excerpt: "Why Uber abandoned PostgreSQL's UUID indexes and how linked leaf nodes solve range query nightmares."
tags:
  [
    "b-trees",
    "databases",
    "indexing",
    "mysql",
    "postgresql",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
key: b-plus-trees-database-indexing
---

## Introduction

This lecture explains why **B+ trees** replaced B-trees in modern databases, using real-world examples like Uber’s PostgreSQL-to-MySQL migration. We’ll explore:

- What B-trees are and their limitations
- How B+ trees optimize storage and queries
- Why your primary key choice (UUID vs ordered ID) matters

---

## Core Concepts/Overview

### What Are B-Trees?

**B-Trees** (Balanced Trees) are self-balancing data structures designed for disk storage.

- **Structure**:
  - Every node contains **keys + values** (data pointers).
  - Nodes split into child pointers (e.g., "keys < 5" go left, "≥5" go right).
- **Use Case**: Minimize disk I/O by storing multiple keys per node.

```asciidoc
Example B-Tree Node (Degree 3):
[Key1|Value1|Key2|Value2|Key3|Value3]
  |        |        |
  ▼        ▼        ▼
Child1  Child2   Child3
```

#### How B-Trees Work

1. **Search**: Start at root, compare keys to navigate down.
2. **Insert**: Split nodes when full to maintain balance.
3. **Range Queries**: Jump between nodes randomly (e.g., fetching keys 1-5 may need 5+ disk reads).

---

### Why B-Trees Failed for Databases

1. **Space Waste**:
   - Non-leaf nodes store **unused values** (values are only needed in leaves).
   - Example: Indexing UUIDs in PostgreSQL bloats all nodes.
2. **Slow Scans**:
   - No linked leaves → range queries thrash the disk.
3. **Memory Pressure**:
   - Fat nodes reduce keys per page → fewer cache hits.

---

### B+ Trees Fix This

- **Internal nodes**: Store **keys only** (no values).
- **Leaf nodes**: Store keys + values, **linked sequentially**.

```asciidoc
B-Tree Node           B+ Tree Internal Node    B+ Tree Leaf Node
[Key|Value|Key|Value] → [Key|Key] → [Key→Value|Key→Value] → [Next Leaf]
```

---

## Key Characteristics

### B+ Tree Advantages Over B-Trees

1. **Faster Range Queries**:
   - Linked leaves allow sequential scanning (e.g., "IDs 4-9" in 1-2 IOs).
2. **Memory Efficiency**:
   - Slim internal nodes fit 10x more keys per page.
3. **Scale-Friendly**:
   - Fewer splits/rebalances than B-trees.

### Trade offs

- **Storage Overhead**: Duplicate keys in internal nodes (minor cost).
- **Complexity**: Leaf node linking requires careful page management.

---

## Practical Implementations

### PostgreSQL vs MySQL

| Feature             | PostgreSQL           | MySQL (InnoDB)        |
| ------------------- | -------------------- | --------------------- |
| **Secondary Index** | Points to heap tuple | Points to primary key |
| **UUID Impact**     | Direct tuple bloat   | PK + index bloat      |

_Example_:  
Uber’s PostgreSQL used UUIDv4 primary keys. Secondary indexes stored **128-bit UUIDs**, causing:

- 40% larger indexes
- Frequent cache misses

**Fix**: Switch to MySQL with auto-increment BIGINT keys:

```sql
-- Problematic UUID setup
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT
);
CREATE INDEX idx_users_email ON users(email); -- Stores full UUIDs

-- Better MySQL approach
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255)
);
CREATE INDEX idx_email ON users(email); -- Stores compact BIGINT refs
```

---

## Conclusion

### 3 Takeaways

1. **B-Trees are inefficient** for databases due to value storage in all nodes.
2. **B+ trees dominate** with linked leaves and lean internals.
3. **Avoid UUIDs as PKs** in systems with secondary indexes.

_Action Step_: Replace one UUID-based index with an ordered ID and compare `EXPLAIN ANALYZE` results.
