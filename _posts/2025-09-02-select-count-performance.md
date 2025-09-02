---
layout: article
title: "How SELECT COUNT Affects Performance"
date: 2025-09-02
modify_date: 2025-09-02
excerpt: "SELECT COUNT(*) has to check every row (or index entry) in PostgreSQL, so counting can be slow on big tables. We learn why and when to use estimates instead."
tags:
  [
    "Backend",
    "PostgreSQL",
    "LectureNotes",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: select-count-performance
---

## Introduction

Ever been surprised that a simple query like `SELECT COUNT(*)` takes a long time on a large table? Counting rows sounds easy, but PostgreSQL usually has to check each row to be sure it is _visible_ to your transaction. In other words, it does **no caching of counts**. As one PostgreSQL guide notes, counting "_can be rather slow because the database has to check visibility for all rows, due to the MVCC model_" . In practice, this means every time you run a count on many rows, the database is doing a lot of work.

In this note, I will explain _why_ that happens and what we can do about it. We will review **how count queries work** under the hood (using index scans and index-only scans), and how commands like VACUUM and ANALYZE affect the process. The big takeaway is: exact counts scan linearly with table size , so for huge tables you may prefer fast estimates over true counts in many cases. Let’s dive in.

## Core Concepts / Overview

When you run `SELECT COUNT(*) FROM table WHERE ...`, PostgreSQL has to examine all the rows (or index entries) that match the condition. How it finds those rows depends on the query and indexes:

- **Index Scan**: If there is an index on a column in the WHERE clause, Postgres will traverse the index to find matching row locations (TIDs), then access the table (**heap**) for each of those rows. It does this to retrieve any needed columns and to verify _visibility_ (i.e. check MVCC version). In other words, an index scan uses the index to find row pointers, **then always goes to the table** for each match . For a count query, Postgres only needs to read one column (e.g. a primary key) but must still confirm the row is not a deleted version.

- **Index-Only Scan**: This is a special fast path where Postgres can answer the query using **only the index** without touching the table. It can happen when **all columns** needed by the query (including those in WHERE and SELECT) are present in the index, and _all_ table pages are marked _all-visible_ in the visibility map . If those conditions are met, the count can be done by scanning the index alone. No table (heap) fetch is needed. Index-only scans cut I/O greatly, but they only work when the index itself contains the data and the visibility map is up-to-date.

However, PostgreSQL indexes do **not** store visibility info. By default, an index-only scan will still perform a _heap fetch_ for any row whose page is not known to be all-visible. In practical terms, if you have recently added or deleted rows, the database might not mark pages clean yet. Running `VACUUM` sets these visibility flags, making truly index-only scans possible . If pages aren’t all-visible, Postgres falls back to a normal index scan with heap fetches.

Overall, **Postgres must count every relevant row**. Because of MVCC (multi-version concurrency control), there is no shortcut like “one master counter” in the database. As the Citus guide explains, _each transaction may see different rows, so there is no single row count that could be cached; the database must scan through all rows counting how many are visible_ . That means the time for an exact count grows roughly linearly with the number of rows in the table or index.

## Key Characteristics

- **Full scan or index scan**: `COUNT(*)` will either do a sequential table scan or use an index scan (whichever the planner thinks is cheapest). Either way, it must visit each matching row. The work grows with table size .

- **Index-only possible with vacuum**: If all needed columns are in an index and the visibility map says pages are clean, Postgres can use an _index-only scan_, avoiding table I/O . In that case you see _Heap Fetches: 0_ in the EXPLAIN output.

- **Heap fetches otherwise**: If a page isn’t marked all-visible, each index match causes a heap fetch to double-check visibility. This makes the count slower. A freshly vacuumed table can eliminate these extra fetches .

- **VACUUM and the visibility map**: Running `VACUUM` on a table updates the _visibility map_, marking pages where all rows are visible to all transactions. After vacuuming, index-only scans hit the table less often. In practice, use `VACUUM` (and `VACUUM ANALYZE`) regularly to keep index-only scans fast .

- **ANALYZE and planner statistics**: The `ANALYZE` command updates table statistics like `pg_class.reltuples` (estimated row count). This helps the planner make better choices and provides a quick estimate of table size. The value of `reltuples` is updated by `VACUUM`, `ANALYZE`, and certain DDL operations . If you haven’t run `ANALYZE` recently and the table changed a lot, those stats can be stale. Thankfully, Autovacuum runs `ANALYZE` automatically in modern PostgreSQL, so the estimates are usually kept fresh .

- **Performance grows with data**: Because of MVCC, exact counting is _always_ linear. The Citus blog shows that doubling the table size roughly doubles the count time . There is no magical log(N) behavior; if you have millions of rows, counting them millions of times is work.

- **Memory and I/O**: If an index fits in memory, index scans will mostly hit RAM and be faster. But the CPU still loops over all entries. If data is on disk, I/O will add to the cost. Either way, frequent large counts can slow down your database and app.

## Advantages & Disadvantages

- **Advantages of exact `COUNT(*)`:**

  - _Accuracy:_ Returns the true number of rows. This is needed for reports or any logic that requires the exact count.
  - _Simplicity:_ Easy to write and understand (`SELECT COUNT(*) FROM ...`). No extra setup needed.
  - _Index usage:_ If a suitable index exists, it can avoid a full table scan. An index-only count (with VACUUM) can be quite fast.

- **Disadvantages of exact `COUNT(*)`:**

  - _Slowness on large tables:_ It must scan or index-scan every matching row, so big tables can make it take seconds or minutes .
  - _Resource heavy:_ A large count can use a lot of CPU and I/O, affecting other queries.
  - _No cached results:_ Each execution does the full work again (unless you manually cache counts). It can’t use a stored total because of MVCC.
  - _Not ideal for real-time UI:_ If you show users a count on every page load, it may time out or lag. Better to use an estimate there.

- **Advantages of estimates / planner counts:**

  - _Very fast:_ Querying `pg_class.reltuples` or using `EXPLAIN` doesn’t scan the table. You just read a stored number, so it returns almost instantly.
  - _Lightweight:_ Almost no extra load on the database, so it can be called frequently (e.g., for a dashboard badge).
  - _Sufficient for many uses:_ An approximate number is often enough for user interfaces or monitoring, where exact precision is not critical.

- **Disadvantages of estimates:**
  - _Inexact:_ The value from `reltuples` or an EXPLAIN is only an _estimate_. It might be off if the table changed a lot since the last ANALYZE.
  - _Staleness:_ If autovacuum hasn’t run recently, the estimate may lag behind the real count. (For example, after bulk inserts, `reltuples` might be much lower than the true count.)
  - _No per-query flexibility:_ Planner estimates use general statistics. If you need the count for a complex `WHERE` clause, you’d have to run `EXPLAIN` and parse the estimate, which may still not be precise.

## Practical Implementations / Examples

In a Node.js/Express app using the `pg` library, we can see how to run an actual count versus an estimate. Below is a simple example:

```js
const { Pool } = require("pg");
const express = require("express");
const app = express();

// Set up PostgreSQL connection pool
const pool = new Pool({
  user: "dbuser",
  host: "localhost",
  database: "mydb",
  password: "secret",
  port: 5432,
});

// Route to get the exact row count using SELECT COUNT(*)
app.get("/count", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS total FROM items");
    res.json({ total: result.rows[0].total });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route to get an estimated row count from pg_class
app.get("/count-estimate", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = 'items'"
    );
    res.json({ estimate: result.rows[0].estimate });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

- **`Pool` and connection:** We use `Pool` from the `pg` module to connect to Postgres. Fill in the connection details (`user`, `host`, etc.) for your database.
- **Exact count (`/count`):** The `/count` route runs `SELECT COUNT(*) AS total FROM items`. This causes Postgres to perform a full count of the `items` table (scanning all rows or using an index). The result is returned as JSON. (On large tables, this query can take time because it _reads all rows_ .)
- **Estimate (`/count-estimate`):** The `/count-estimate` route runs a query on the system table `pg_class`: `reltuples` is an **estimated** number of rows in `items`. This value is maintained by Postgres when you run `ANALYZE` . Reading it is very fast because it does not scan `items`. We cast `reltuples` to `bigint` just to format it nicely. The JSON response returns this approximate count.
- **Usage:** In practice, your app might use the `/count` endpoint when you truly need the exact number (perhaps a daily report), and use `/count-estimate` when you only need a rough idea (for example, displaying how many items exist without precise accuracy).

## Conclusion

Counting rows with `SELECT COUNT(*)` in PostgreSQL is straightforward but _not_ cheap. Since Postgres must account for MVCC visibility, it essentially walks through all matching rows (or index entries) on every count . This makes exact counts slow on large tables and growing linearly with data size.

On the other hand, we saw that Postgres keeps approximate row counts in its statistics (like `pg_class.reltuples`) which you can query quickly . If you run `VACUUM ANALYZE` regularly, those stats stay updated and can give you a good estimate with almost zero work.

**When to use each:** If your application really needs the exact number (for audit or correctness), use `SELECT COUNT(*)`, but be aware of its cost. If an estimate is enough (like in a user interface or monitoring), use the planner’s estimate from `pg_class` or `EXPLAIN`. In a sense, the _insight_ is: _exact counts are heavy but precise; estimates are light but approximate_. Knowing this helps you design your backend wisely, choosing counts only when needed and relying on estimates otherwise.
