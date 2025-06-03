---
layout: article
title: "Comprehensive Database Indexing & Performance Notes"
date: 2025-04-16
modify_date: 2025-04-16
excerpt: "Detailed personal notes covering clustered/non-clustered indexes, composite indexes, UUID performance, bitmap scans, and billion-row table strategies."
tags:
  [
    "Database",
    "PostgreSQL",
    "Indexing",
    "Optimization",
    "B-Tree",
    "LSM",
    "BloomFilters",
    "UUID",
    "LectureNotes",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: true
mathjax_autoNumber: true
key: db-indexing-deep-dive
---

## Database Indexing & Performance Optimization

## Introduction

These are my personal notes from Hussein's lecture series on database internals. Covers everything from basic B-tree structures to advanced topics like handling billion-row tables. Focuses on PostgreSQL, but concepts apply to other databases.

---

## Core Index Structures

### Clustered Indexes (SQL Server Specific)

- **Physical Storage**: Data rows stored in leaf nodes of the B-tree (1:1 with table)
- **Partitioning**: Each partition has its own B-tree structure (e.g., 4 partitions = 4 B-trees)
- **Allocation Units**:
  - `IN_ROW_DATA`: Regular data (always exists)
  - `LOB_DATA`: For large objects (if LOB columns exist)
  - `ROW_OVERFLOW`: When row size exceeds 8,060 bytes

### Non-Clustered Indexes

- **Separate Structure**: Contains key columns + row locators
- **Row Locators**:
  - Heap tables: Physical pointer (File ID + Page # + Slot #)
  - Clustered tables: Clustered key value
- **Double-Linked Lists**: Pages at each level are linked for range scans

### B-Tree vs LSM Trees

| Feature   | B-Tree               | LSM Tree                 |
| --------- | -------------------- | ------------------------ |
| Writes    | In-place updates     | Append-only (SSTables)   |
| Reads     | Faster (single seek) | May need multiple merges |
| Use Cases | OLTP                 | High write throughput    |

---

## Advanced Index Strategies

### Composite Indexes (Real-World Example)

**Table**: `test(a int, b int, c int)` with 12M rows  
**Query Patterns**:

1. `WHERE a = ?`
2. `WHERE b = ?`
3. `WHERE a = ? AND b = ?`

**Experimentation Results**:

1. **Two Single Indexes**:

   ```sql
   CREATE INDEX idx_a ON test(a);
   CREATE INDEX idx_b ON test(b);
   ```

   - Query 1: Uses `idx_a` (253ms)
   - Query 2: Uses `idx_b` (250ms)
   - Query 3: **BitmapAnd** (combines both indexes)

2. **Composite Index**:

   ```sql
   CREATE INDEX idx_a_b ON test(a,b);
   ```

   - Query 1: Uses composite (250ms)
   - Query 2: **Full Table Scan** (can't use rightmost column)
   - Query 3: Blazing fast (0.5ms)

**Key Insight**: Order matters! Composite indexes only help leftmost columns.

### Index-Only Scans

**Magic Trick**: Include frequently selected columns:

```sql
CREATE INDEX idx_grade_inc_id ON students(grade) INCLUDE (id);
```

- Before: Index Scan + Heap Fetch (16 sec for 50M rows)
- After: Index-Only Scan (4 sec)

**Requirement**: Run `VACUUM` to update visibility maps

---

## Performance Deep Dives

### Bitmap Scans Demystified

**Scenario**: `SELECT * FROM grades WHERE grade > 95 AND id < 10000`

1. **Process**:

   - Build bitmap for `grade > 95` (sets bits for qualifying pages)
   - Build bitmap for `id < 10000`
   - **Bitwise AND** operation combines them
   - Fetch only matching pages from heap

2. **Why Better?**:
   - Avoids random I/O (single pass to heap)
   - Example: 9,000 rows → 394 after AND (PostgreSQL demo showed 0.5ms)

### UUID Performance Disaster

**Problem**: Random UUIDv4 inserts cause:

- **Page Splits**: 50% fill efficiency in B-trees
- **Buffer Pool Thrashing**: Constant cache misses

**Shopify Case Study**:

- Switched to ULID (time-ordered)
- Improved both writes **and** reads (locality benefit)

**Visualization**:

```text
[Page1: 10, 90] → Insert 80 → SPLIT → [10,80] ↔ [90]
vs
[Page1: 10,20] → Insert 30 → [10,20,30] (sequential)
```

---

## Billion-Row Table Strategies

### Horizontal Partitioning

**Implementation**:

```sql
CREATE TABLE sales (
    id serial,
    sale_date date,
    amount decimal
) PARTITION BY RANGE (sale_date);
```

**Benefits**:

- Queries only scan relevant partitions
- Indexes per partition (smaller = faster)

### Sharding Tradeoffs

**Pros**:

- Distributes load (e.g., customer 1-100K on Shard1)

**Cons**:

- No cross-shard transactions
- Application must route queries

### Alternative Design

**Twitter Followers Example**:

```sql
-- Original (doesn't scale):
CREATE TABLE follows (follower_id int, followee_id int);

-- Better:
ALTER TABLE profiles ADD COLUMN followers jsonb[];
```

**Tradeoff**: Denormalization vs JOIN performance

---

## PostgreSQL-Specific Optimizations

### `EXPLAIN ANALYZE` Decoded

**Output Example**:

```text
Bitmap Heap Scan (cost=42.15..15800.00 rows=1000)
  Recheck Cond: (grade > 80)
  Heap Blocks: exact=900
  -> Bitmap Index Scan (cost=0.00..42.00 rows=1000)
       Index Cond: (grade > 80)
```

**Key Metrics**:

- `cost=0.00..42.00`: Startup cost..total cost
- `rows=1000`: Estimated rows
- `Heap Blocks exact=900`: Pages fetched

### Concurrent Index Creation

```sql
CREATE INDEX CONCURRENTLY idx_name ON big_table(column);
```

**Why?**:

- Doesn't block writes
- Trade off: 2-3x slower, can fail if duplicates inserted

---

## Critical Lessons

1. **Index Selection**:

   - 20% of indexes cause 80% of performance gains
   - More indexes ≠ better (writes get slower)

2. **The 3 Rules**:

   - Index columns in `WHERE/JOIN/ORDER BY`
   - Keep indexes narrow (fewer columns)
   - Favor high-selectivity columns

3. **Maintenance**:

   ```sql
   VACUUM ANALYZE table_name; -- Update statistics
   REINDEX INDEX bad_index; -- Fix bloat
   ```

> **Personal Note**: Always test with production-like data volumes. The 50M-row test table revealed issues my 10K-row dev dataset never showed!
