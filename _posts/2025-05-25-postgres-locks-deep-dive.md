---
layout: article
title: "Understanding Postgres Locks: A Deep Dive"
date: 2025-06-25
modify_date: 2025-06-25
excerpt: "A practical and clear overview of Postgres lock types, their behaviors, and real-world implications."
tags:
  [
    "PostgreSQL",
    "Database",
    "LectureNotes",
    "Locks",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: true
mathjax_autoNumber: true
key: postgres-locks-deep-dive
---

## Introduction

> _"I used to think database locks are two types, shared and exclusive... But in Postgres this binary view changed completely"_. This quote from Hussein Nasser’s lecture captures my first surprise: Postgres actually has five lock categories and over a dozen lock modes. The official docs explain why: for example, a `TRUNCATE` must acquire an **ACCESS EXCLUSIVE** lock so it can’t run alongside other operations. In short, it became clear that what matters most is knowing _which commands block each other_, not just “read” vs “write” locks. The author even built a [Postgres Lock Conflicts tool](https://postgres-locks.husseinnasser.com) to visualize this in a matrix. (All claims here come from official Postgres docs and the lecture.)

## Core Concepts / Overview

Postgres locks can be grouped by purpose. For example, the docs show five main categories: table-level locks, row-level locks, page-level locks, deadlock handling, and advisory locks. Each category has multiple modes; in particular there are **eight table-level lock modes** (plus a few row-lock modes). The key idea is _conflict_: some locks interfere with others. As the docs state, _“the only real difference between one lock mode and another is the set of lock modes with which each conflicts”_. In practice that means two transactions can hold _non-conflicting_ locks on the same table at the same time. But if they conflict, one will block. This is why it’s essential to know which lock each SQL command takes, and what it conflicts with.

## Key Characteristics

Below are the major table lock modes and their behaviors. The **lock name** is in bold, and I list what operations get that lock and what locks it conflicts with (so we know what it blocks).

- **ACCESS EXCLUSIVE**: This is the _strongest_ table lock. It conflicts with **every other lock**, so nothing else can happen on that table while it’s held. It’s taken by heavy DDL or maintenance commands (e.g. `DROP TABLE`, `TRUNCATE`, `REINDEX`, `CLUSTER`, `VACUUM FULL`, `REFRESH MATERIALIZED VIEW`, and many `ALTER` commands). In other words, if you run something that needs ACCESS EXCLUSIVE, _everything_ else (reads, writes, DDL) on that table will wait.

- **ACCESS SHARE**: The _lightest_ table lock. Any read-only command (like a simple `SELECT` or `COPY TO`) acquires ACCESS SHARE. It only conflicts with ACCESS EXCLUSIVE. _Insight:_ This means regular selects do not block each other or most changes. Only an operation that needs ACCESS EXCLUSIVE (like `VACUUM FULL`) will wait for the SELECT to finish.

- **EXCLUSIVE**: This lock conflicts with _all_ other locks except ACCESS SHARE. It allows readers (ACCESS SHARE) but blocks data changes and schema changes. In Postgres, this mode is only used by one built-in command: `REFRESH MATERIALIZED VIEW CONCURRENTLY`. That way you can read the table while the concurrent refresh runs, but you block other writers.

- **ROW SHARE**: Used by `SELECT ... FOR UPDATE/SHARE/KEY SHARE` commands. It conflicts with EXCLUSIVE and ACCESS EXCLUSIVE locks, but not with a plain SELECT. In effect, it says “I’m locking some rows” but still allows normal reads by others.

- **ROW EXCLUSIVE**: Taken by any data-changing command on a table (INSERT, UPDATE, DELETE, MERGE). It conflicts with stronger locks: **SHARE**, **SHARE ROW EXCLUSIVE**, **EXCLUSIVE**, and **ACCESS EXCLUSIVE**. This means if another transaction is doing something that requires SHARE or higher on the table, a row-change will wait. (Notably, UPDATE or DELETE always take a ROW EXCLUSIVE even if they touch no rows.)

- **SHARE ROW EXCLUSIVE**: This special lock is acquired by commands like `CREATE TRIGGER` or adding a foreign key. It blocks ROW EXCLUSIVE and weaker locks on others, and _even conflicts with itself_ (only one such operation at a time). In effect, it allows SELECTs (even FOR UPDATE) but blocks normal INSERT/UPDATE/DELETE.

- **SHARE**: Taken by `CREATE INDEX` (without CONCURRENTLY). It conflicts with locks that allow data modification (ROW EXCLUSIVE, etc.), because building an index must see a stable table. But SHARE locks do _not_ conflict with each other – you could theoretically build multiple indexes at once (though that is rarely practical).

- **SHARE UPDATE EXCLUSIVE**: Used by plain `VACUUM` (non-FULL), `ANALYZE`, `CREATE INDEX CONCURRENTLY`, and many `ALTER TABLE` variants. It conflicts with SHARE, SHARE ROW EXCLUSIVE, EXCLUSIVE, and ACCESS EXCLUSIVE, and even with itself (two VACUUMs can’t run at once). The idea is to allow normal reads/writes while _blocking schema changes_. For example, a running `VACUUM` won’t stop INSERTs, because it only holds SHARE UPDATE EXCLUSIVE (not ACCESS EXCLUSIVE).

Each of these modes shows why Postgres needs many lock types: they let reads and writes coexist when possible, while still preventing dangerous overlaps. _Insider tip:_ only an ACCESS EXCLUSIVE lock will ever block a simple SELECT (without `FOR UPDATE`), so most locks let reads proceed.

## Advantages & Disadvantages

- **Advantages:**

  - _Fine-grained control._ More lock types means only the truly conflicting operations block each other. For example, a plain `SELECT` (ACCESS SHARE) doesn’t interfere with another `SELECT`, or even a normal `VACUUM` (since that only takes SHARE UPDATE EXCLUSIVE). Specialized locks (like EXCLUSIVE for materialized views) let Postgres allow concurrency where possible.
  - _Performance and safety._ By matching lock strength to the operation, Postgres avoids unnecessary contention while still ensuring data integrity.

- **Disadvantages:**

  - _Complexity._ It’s a lot to remember! With so many modes, it can be tricky to predict exactly which commands will block each other. I had to rely on charts and tools to keep track. Having many lock types means more room for surprises (and potential deadlocks) if you’re not careful.
  - _Mental load._ Each operation (SELECT, INSERT, ALTER, etc.) can obtain multiple locks, and different `ALTER TABLE` forms take different modes. Understanding all these details requires careful study of the docs (or a handy cheat sheet).

> _Tip:_ Despite the complexity, learning these locks _really_ helps with tuning and debugging. I noticed queries would stop hanging as soon as I understood which session held a table lock.

## Practical Examples

To make this concrete, here is the Postgres lock conflict matrix (from the docs) showing which table locks conflict. `X` means the two locks cannot be held together:

```pgsql
|                    | ACCESS SHARE | ROW SHARE | ROW EXCL. | SHARE UPDATE EXCL. | SHARE | SHARE ROW EXCL. | EXCL. | ACCESS EXCL. |
|--------------------|--------------|-----------|-----------|--------------------|-------|-----------------|-------|--------------|
| ACCESS SHARE       |              |           |           |                    |       |                 |       | X            |
| ROW SHARE          |              |           |           |                    |       |            X    | X     | X            |
| ROW EXCL.          |              |           |           |    X               | X     |            X    | X     | X            |
| SHARE UPDATE EXCL. |              |           |           |          X         | X     |            X    | X     | X            |
| SHARE              |              |           |    X      |          X         |       |            X    | X     | X            |
| SHARE ROW EXCL.    |              |           |    X      |          X         | X     |            X    | X     | X            |
| EXCL.              |              |      X    |    X      |          X         | X     |            X    | X     | X            |
| ACCESS EXCL.       |      X       |      X    |    X      |          X         | X     |            X    | X     | X            |
```

You can explore these conflicts interactively with the [Postgres Lock Conflicts tool](https://postgres-locks.husseinnasser.com) mentioned earlier. For example, it shows that `VACUUM FULL` (ACCESS EXCLUSIVE) blocks all selects, while a normal `VACUUM` (SHARE UPDATE EXCLUSIVE) does _not_ block queries.

Here are a couple of SQL snippets to illustrate:

```sql
-- Session A:
SELECT * FROM my_table;  -- acquires ACCESS SHARE

-- Session B (simultaneous):
VACUUM FULL my_table;    -- needs ACCESS EXCLUSIVE, so it will wait until the SELECT is done:contentReference[oaicite:34]{index=34}.
```

```sql
-- If instead we run a normal VACUUM:
BEGIN;
VACUUM my_table;         -- takes SHARE UPDATE EXCLUSIVE (allows concurrent reads/writes):contentReference[oaicite:35]{index=35}.
COMMIT;
```

In practice, running `VACUUM FULL` will block concurrent selects/updates on that table, whereas a plain `VACUUM` will _not_. These examples come straight from the lecture’s discussion of VACUUM and locks.

## Conclusion

Learning about Postgres locks totally changed how I view concurrent database activity. I no longer think of locks as just “shared vs exclusive”. Instead, I know that every command takes a very specific lock mode, and I can check `pg_locks` to see them in action.

> _“Understanding Postgres locking will give you an edge to making better application design choices”_ – this advice from the lecture rings true. Now, when I design schema changes or troubleshoot a slow query, I remember which locks are at play. It makes me more confident that I can predict when one session will block another, and I can pick the least disruptive way to do maintenance. These notes will definitely save me time next time I see a lock-wait issue.
