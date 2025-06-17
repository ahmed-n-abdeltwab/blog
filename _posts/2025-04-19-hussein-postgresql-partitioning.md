---
layout: article
title: "PostgreSQL Partitioning – Real-World Lessons from Hussein's Database Lectures"
date: 2025-04-19
modify_date: 2025-04-19
excerpt: "Detailed notes on horizontal partitioning from Hussein's lecture series. Includes real PostgreSQL examples, performance tips, automation scripts, and how partitions improve query speed."
tags:
  [
    "Partitioning",
    "PostgreSQL",
    "Database",
    "LectureNotes",
    "Performance",
    "SQL",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: hussein-postgresql-partitioning
---

## Introduction

These are my personal notes from **Hussein Nasser's lecture series on database fundamentals**. This lecture covered **horizontal partitioning in PostgreSQL**, how to use it, and when it helps.

---

## Core Concepts / Overview

### What is Partitioning?

Partitioning splits one big table into smaller sub-tables (partitions). The database decides which partition to use at query time, depending on the `WHERE` clause.

- Horizontal partitioning = split by rows
- Vertical partitioning = split by columns
- Focus was mostly on **horizontal partitioning**

---

## Key Characteristics

## Partition Types

- **Range**: rows fall into partitions based on a numeric or date range
- **List**: rows split by fixed values (e.g., states, zip codes)
- **Hash**: rows assigned by hash result
- **Vertical**: columns are split; useful for large blob/text fields

## PostgreSQL Facts

- Parent table is empty. It's just metadata.
- Indexes created on the parent propagate to all partitions (Postgres 11+)
- Partition pruning: planner ignores irrelevant partitions (must be enabled)

---

## Practical Implementation

## Setup Postgres in Docker

```bash
docker run --name pgdemo -e POSTGRES_PASSWORD=secret -d postgres
docker exec -it pgdemo bash
psql -U postgres
```

## Create Original Table & Insert Data

```sql
CREATE TABLE grades_original (
  id SERIAL NOT NULL,
  g INT NOT NULL
);

INSERT INTO grades_original(g)
SELECT floor(random()*100)::int
FROM generate_series(1, 10000000);

CREATE INDEX idx_grades_original_g ON grades_original(g);
```

## Create Partitioned Table

```sql
CREATE TABLE grades_parts (
  id SERIAL NOT NULL,
  g INT NOT NULL
) PARTITION BY RANGE (g);
```

## Create & Attach Partitions

```sql
CREATE TABLE g_00_35  (LIKE grades_parts INCLUDING ALL);
CREATE TABLE g_36_60  (LIKE grades_parts INCLUDING ALL);
CREATE TABLE g_61_80  (LIKE grades_parts INCLUDING ALL);
CREATE TABLE g_81_100 (LIKE grades_parts INCLUDING ALL);

ALTER TABLE grades_parts ATTACH PARTITION g_00_35  FOR VALUES FROM (0)  TO (35);
ALTER TABLE grades_parts ATTACH PARTITION g_36_60  FOR VALUES FROM (35) TO (60);
ALTER TABLE grades_parts ATTACH PARTITION g_61_80  FOR VALUES FROM (60) TO (80);
ALTER TABLE grades_parts ATTACH PARTITION g_81_100 FOR VALUES FROM (80) TO (100);
```

## Insert Data Into Partitions

```sql
INSERT INTO grades_parts SELECT * FROM grades_original;
```

PostgreSQL decides which partition each row goes to based on the value of `g`.

## Indexing Partitions

```sql
CREATE INDEX idx_grades_parts_g ON grades_parts(g);
```

The above command creates indexes on all child partitions.

## Query & Benchmark

```sql
EXPLAIN ANALYZE
SELECT COUNT(*) FROM grades_parts WHERE g = 30;
```

- Hits only 1 partition (`g_00_35`) if **partition pruning** is enabled.
- Partition pruning reduces query time **from seconds to milliseconds** for large tables.

---

## Automating Partition Creation with Node.js

Hussein used Node.js to generate 100 partitions programmatically:

```js
import pkg from "pg";
const { Client } = pkg;

const TOTAL = 1_000_000_000;
const STEP = 10_000_000;

async function main() {
  const client = new Client({
    connectionString: "postgres://postgres:secret@localhost:5432",
  });
  await client.connect();
  await client.query("CREATE DATABASE customers;");
  await client.end();

  const db = new Client({
    connectionString: "postgres://postgres:secret@localhost:5432/customers",
  });
  await db.connect();
  await db.query(`
    CREATE TABLE customers (
      id INT NOT NULL,
      name TEXT
    ) PARTITION BY RANGE (id);
  `);

  for (let i = 0; i < TOTAL / STEP; i++) {
    const from = i * STEP;
    const to = from + STEP;
    const name = `customers_${from}_${to}`;
    await db.query(`CREATE TABLE ${name} (LIKE customers INCLUDING ALL);`);
    await db.query(
      `ALTER TABLE customers ATTACH PARTITION ${name} FOR VALUES FROM (${from}) TO (${to});`
    );
  }

  await db.end();
}

main();
```

---

## Performance Notes

## Partition vs Non-partition Index Size

- Full table index (10M rows): ~69 MB
- The Smallest partition index: ~24 MB
- Smaller indexes are faster to query time on full table: ~2–3 seconds
- Query time on partition: ~1 second or less

## Partition Pruning

```sql
SHOW enable_partition_pruning; -- Should be ON
```

If off, the planner hits **all** partitions, which defeats the purpose.

---

## Advantages & Disadvantages

## Pros

- Query speed increases
- Smaller, faster indexes
- Easy to bulk load into individual partitions
- Move old partitions to slower disks (archival)

## Cons

- **Row updates** that change partition key = delete + insert (slow)
- **Bad queries** (e.g., WHERE id > 1) = scans all partitions
- Schema changes may need more care depending on DBMS

---

## Conclusion

Partitioning is one of the best techniques to handle large datasets, and Hussein’s examples made it super clear. You can see actual performance boosts only when the table is large enough and memory is limited (I/O-bound scenarios). For smaller tables or well-tuned memory, it may not show immediate speed gains.

Biggest lesson:

> "The fastest way to query a table with a billion rows is to avoid querying a table with a billion rows." — Hussein
