---
layout: article
title: "Why SQL Pagination With Offset is Slow and How to Optimize It"
date: 2025-05-01
modify_date: 2025-05-01
excerpt: "Learn why using OFFSET for pagination harms performance and discover efficient alternatives like keyset pagination."
tags:
  [
    "Database",
    "Pagination",
    "Performance",
    "SQL",
    "LectureNotes",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
key: sql-pagination-offset
---

## Why SQL Pagination With Offset is Slow and How to Optimize It

## Introduction

**Pain Point:** Your web app becomes sluggish when users request page 1000 of results. The database groans under the weight of `OFFSET 10000`, delivering results slower than a dial-up connection.

This lecture explains why `OFFSET`-based pagination is inefficient for large datasets, demonstrates its performance pitfalls, and introduces **keyset pagination** as a faster alternative.

**Key Revelation:** _`OFFSET` forces databases to process all skipped rows, making it fundamentally unscalable. There’s a better way._

---

## Core Concepts

### How `OFFSET` Works

- **Definition:** `OFFSET X` instructs the database to _fetch and discard_ the first `X` rows before returning results.
- **Example:** `SELECT * FROM news ORDER BY id DESC OFFSET 1000 LIMIT 10` forces the database to:
  1. Read 1010 rows from disk/index.
  2. Discard the first 1000.
  3. Return the remaining 10.

### Why `OFFSET` Fails at Scale

1. **I/O Overhead:** Fetching 100,010 rows to return 10 wastes disk I/O and CPU cycles.
2. **Inconsistent Results:** Newly inserted rows shift offsets, causing duplicates (e.g., page 11 shows rows from page 10).
3. **Lock Contention:** Large offsets may trigger full table scans, blocking writes.

---

## Key Characteristics of Efficient Pagination

### Keyset (Cursor-Based) Pagination

- **Principle:** Use a unique, indexed column (e.g., `id`) to "remember" the last seen record.
- **Implementation:**

  ```sql
  -- First page
  SELECT title, id FROM news ORDER BY id DESC LIMIT 10;

  -- Next page (using last seen id=12345)
  SELECT title, id FROM news WHERE id < 12345 ORDER BY id DESC LIMIT 10;
  ```

- **Benefits:**
  - **Index Scan Only:** Uses the index to skip rows instantly, avoiding full data scans.
  - **Consistency:** Immune to mid-pagination data changes.
  - **Speed:** Processes only `LIMIT` rows, not `OFFSET + LIMIT`.

---

## Practical Implementation

### Example: News Article Pagination

**Problem:** Retrieve page 1000 of news articles sorted by recency.

**Bad Approach (Offset):**

```sql
SELECT title FROM news ORDER BY id DESC OFFSET 10000 LIMIT 10;
```

- **Execution Time:** 620ms (for 1M rows).
- **Reason:** Reads 10,010 rows but returns 10.

**Optimized Approach (Keyset):**

```sql
SELECT title, id FROM news
WHERE id < (last_seen_id)
ORDER BY id DESC LIMIT 10;
```

- **Execution Time:** 0.2ms.
- **Reason:** Uses `id` index to jump directly to the desired rows.

---

## Conclusion

- **Avoid `OFFSET` for Large Datasets:** It’s a performance time bomb.
- **Use Keyset Pagination:** Leverage indexed columns for instant navigation.
- _Trade-off:_ Requires client-side tracking of the last seen record (e.g., via API tokens).

> > **Lecture Highlight:**  
> _"`OFFSET` is like reading a 1000-page book to find page 10. Keyset pagination is flipping directly to it."_

**Further Reading:** Explore [Use The Index, Luke](https://use-the-index-luke.com/) for advanced database optimization techniques.
