---
layout: article
title: "Why PostgreSQL Chooses Bitmap Heap Scan Over Index-Only Scan"
date: 2025-05-28
modify_date: 2025-05-28
excerpt: "Explains why PostgreSQL falls back to a bitmap heap scan instead of an index-only scan, focusing on MVCC visibility and the visibility map."
tags:
  [
    "PostgreSQL",
    "IndexOnlyScan",
    "BitmapHeapScan",
    "MVCC",
    "Performance",
    "LectureNotes",
    "Q&A",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: postgres-index-only-scan
---

## Introduction

Have you ever run a simple `COUNT(*)` and expected an **index-only scan**, only to see a **bitmap heap scan** instead? It can be frustrating when you know the index exists, yet the planner takes a slower path.  
This lecture answers that exact question: **Why does PostgreSQL use a bitmap heap scan when an index-only scan seems possible?**

> “A bitmap index scan just marks pages, then fetches tuples from the heap.”  
> The key revelation is that PostgreSQL must verify row visibility (MVCC data) in the heap, unless the visibility map shows all rows on a page are safe.

## Core Concepts / Overview

- **MVCC (MultiVersion Concurrency Control):**

  - Each row carries hidden **`xmin`** and **`xmax`** system columns.
  - These columns determine if a transaction can see or must ignore a tuple.

- **Index-Only Scan:**

  - Reads data solely from the index, without touching the heap.
  - Requires every row on each page to be marked “all-visible” in the visibility map.

- **Bitmap Index Scan + Heap Fetch:**
  1. Scan the index and build a bitmap of matching page numbers.
  2. Visit each heap page, fetch all tuples, then reapply the filter.

## Key Characteristics

- **Hidden System Columns**
  - `xmin`: Transaction ID that inserted the tuple.
  - `xmax`: Transaction ID that deleted or updated the tuple.
- **Visibility Map**
  - A shared structure marking pages where all tuples are visible to all transactions.
  - Updated by **`VACUUM`** to avoid repeated heap checks.
- **Planner Decisions**
  - Without “all-visible” flags, the planner must fetch heap pages to check `xmin`/`xmax`.
  - Even in a simple `COUNT(*)`, tuple visibility checks force a heap fetch.

## Advantages & Disadvantages

- **Index-Only Scan**

  - **Advantages:**
    - Faster I/O, since no heap pages are read.
    - Lower CPU work—no tuple reconstruction from the heap.
  - **Disadvantages:**
    - Requires up-to-date visibility map.
    - May not be possible right after heavy inserts/updates.

- **Bitmap Heap Scan**
  - **Advantages:**
    - Reliable: always returns correct visibility results.
    - Good when many rows match—coalesces I/O.
  - **Disadvantages:**
    - Extra heap fetch cost when visibility map is not set.
    - More planning and memory overhead to build bitmaps.

## Practical Example

1. **Set up and query**

   ```sql
   CREATE TABLE grades (
     id SERIAL PRIMARY KEY,
     grade INT
   ) PARTITION BY RANGE (grade);
   -- create partitions, insert ~1,000 rows
   EXPLAIN ANALYZE
     SELECT COUNT(*) FROM grades_main WHERE grade = 1;
   ```

2. **Unexpected Plan**

   - Planner shows `Bitmap Index Scan` on the index
   - Followed by `Bitmap Heap Scan`, fetching heap pages

3. **Fix with VACUUM**

   ```sql
   VACUUM grades_main;
   EXPLAIN ANALYZE
     SELECT COUNT(*) FROM grades_main WHERE grade = 1;
   ```

   - Now planner can use **Index-Only Scan** because the visibility map is updated.

## Conclusion

- PostgreSQL needs to verify tuple visibility before trusting an index-only path.
- The **visibility map**, maintained by `VACUUM`, tells the planner which pages are “all-visible.”
- Running `VACUUM` on a fresh or heavily modified table often enables **index-only scans**.
- _Next time you see a bitmap heap scan, check your visibility map!_
