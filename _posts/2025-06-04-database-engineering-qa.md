---
layout: article
title: "Database Engineering Q&A: Indexing, Durability, Locks, and More"
date: 2025-06-04
modify_date: 2025-06-04
excerpt: "This Q&A session covers key database engineering concepts including indexing in PostgreSQL, durability in Redis, lock management in transactions, and the differences between various indexing strategies."
tags:
  [
    "Database",
    "SQL",
    "Indexing",
    "Transactions",
    "Redis",
    "PostgreSQL",
    "LectureNotes",
    "Q&A",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
key: database-engineering-qa
---

## Introduction

As I dive deeper into database engineering, I’m realizing how crucial it is to understand the inner workings of databases to optimize performance and ensure data reliability. Recently, I reviewed a Q&A session from an _Introduction to Database Engineering_ course, where the instructor, Hussein, tackled some thought-provoking student questions. The session covered topics like indexing and query optimization in PostgreSQL, durability in Redis, lock management in transactions, and different indexing strategies. In these notes, I’ll summarize the key takeaways from the lecture, reflecting on how these concepts enhance my understanding of databases and their real-world applications.

## Question 1: Understanding Explain Analyze and Heap Fetches in PostgreSQL

### Overview

A student asked why they were getting different results when running the **EXPLAIN ANALYZE** command on the same query multiple times, particularly noticing variations in **heap fetches** during **index-only scans**.

### Key Characteristics

Hossein explained that in PostgreSQL, an **index-only scan** is designed to retrieve data directly from the index without accessing the **heap** (the main table storing the full data). However, sometimes the database still needs to check the heap for **visibility information** due to PostgreSQL’s **Multi-Version Concurrency Control (MVCC)** system. This leads to **heap fetches**, which can cause variations in query performance.

- **Heap Fetches**: Occur when PostgreSQL checks the heap to determine if a row is visible (e.g., not deleted or updated by another transaction).
- **MVCC**: PostgreSQL’s mechanism to manage concurrent transactions by maintaining multiple versions of a row.
- **Vacuuming**: Running the **VACUUM** command cleans up old row versions, reducing unnecessary heap fetches and stabilizing query performance.
- **Timing Variability**: Small timing differences (e.g., 0.004 vs. 0.17 milliseconds) are often due to hardware factors or other processes running on the system, and are generally not significant unless they exceed 10 milliseconds.

> “If you don’t vacuum after all the updates, then you should get consistent results as of the timing.” – Hossein

### Practical Example

Consider a query like:

```sql
EXPLAIN ANALYZE SELECT id FROM employees WHERE id = 1000;
```

If the query performs an index-only scan but still shows heap fetches, it might be checking the heap for visibility due to unvacuumed rows or long-running transactions. Running **VACUUM** can help minimize these fetches.

### Reflection

_This explanation helped me understand why query performance can vary and the importance of regular database maintenance like vacuuming. It’s a reminder that even small details, like cleaning up old data, can impact performance._

## Question 2: Durability and Persistence in Redis

### Overview

Another question focused on the difference between **durability** and **persistence** in the context of Redis, an in-memory database.

### Key Characteristics

Hossein clarified that **persistence** means writing data to a non-volatile storage medium (like a disk) so it survives power loss. **Durability**, a database term, ensures that once a transaction is committed, the data is permanently saved, even if the system crashes immediately after.

Redis, being an in-memory database, stores data in **RAM**, which is volatile. However, it offers two persistence mechanisms to achieve durability:

- **Snapshotting**: Asynchronously writes the entire dataset to disk periodically. There’s a risk of data loss if the system crashes between snapshots.
- **Append-Only File (AOF)**: Logs every write operation to a disk file, ensuring stronger durability by recording each transaction before it’s considered committed.

| Persistence Method     | Description                                   | Durability Level                              | Performance Impact                |
| ---------------------- | --------------------------------------------- | --------------------------------------------- | --------------------------------- |
| Snapshotting           | Periodically saves the entire dataset to disk | Weaker (data loss possible between snapshots) | Faster, as writes go to RAM first |
| Append-Only File (AOF) | Logs every write to disk                      | Stronger (minimal data loss risk)             | Slower, due to disk writes        |

### Advantages & Disadvantages

- **Snapshotting**:
  - **Advantages**: Fast writes since data is initially stored in RAM; suitable for applications where occasional data loss is acceptable.
  - **Disadvantages**: Risk of losing data written since the last snapshot if a crash occurs.
- **AOF**:
  - **Advantages**: High durability, similar to traditional relational databases; minimal data loss risk.
  - **Disadvantages**: Slower performance due to synchronous disk writes.

### Practical Example

In Redis, you might configure snapshotting to save data every 60 seconds:

```bash
save 60 1000  # Save if 1000 keys changed in 60 seconds
```

For stronger durability, enable AOF:

```bash
appendonly yes
```

This logs every write operation, ensuring data is safe even after a crash.

### Reflection

_The trade-off between performance and durability in Redis is fascinating. It’s clear that choosing the right configuration depends on the application’s needs—speed for caching or durability for critical data._

## Question 3: Lock Management in Database Transactions

### Overview

A student asked about the lifecycle of a lock in a transaction, specifically whether an **exclusive lock** on a row persists until the transaction is committed.

### Key Characteristics

Hossein explained that when a row is updated, an **exclusive lock** is acquired to prevent other transactions from modifying it. This lock is held until the transaction is either **committed** or **rolled back**. The behavior varies across databases:

- **Row-Level Locking**: Supported by databases like PostgreSQL, where only the updated row is locked.
- **Table-Level Locking**: Some databases lock the entire table for simplicity, which can reduce concurrency.
- **MVCC in PostgreSQL**: When a row is updated, a new version is created, and the lock applies to the new version. Other transactions can still read the old version, depending on the isolation level.

> “Once you effectively rollback or commit the transaction, this lock is gone.” – Hossein

### Practical Example

In PostgreSQL, updating a row might look like:

```sql
BEGIN;
UPDATE employees SET salary = salary + 1000 WHERE id = 1000;
COMMIT;
```

During the update, an exclusive lock is placed on the row with `id = 1000`, preventing other transactions from modifying it until the transaction completes.

### Reflection

_Lock management is critical for preventing conflicts in concurrent systems. Learning how PostgreSQL’s MVCC allows reading old row versions while locking new ones was eye-opening—it’s a clever way to balance concurrency and consistency._

## Question 4: Differences Between Regular Indexes and Indexes with Included Columns

### Overview

The final question explored the difference between creating separate indexes on columns versus creating an index with **included columns**.

### Key Characteristics

Hossein clarified that:

- **Separate Indexes**: Creating indexes on different columns (e.g., one on `id` and another on `name`) results in multiple index structures (e.g., two B-trees). Each index supports queries filtering on its respective column.
- **Index with Included Columns**: An index on a key column (e.g., `id`) with an included column (e.g., `name`) stores the included column’s values in the index. This allows queries filtering on the key column and selecting the included column to avoid accessing the heap.

| Index Type                  | Structure                          | Query Support                                          | Storage Overhead                   |
| --------------------------- | ---------------------------------- | ------------------------------------------------------ | ---------------------------------- |
| Separate Indexes            | Multiple B-trees (one per column)  | Filters on any indexed column                          | Higher, due to multiple structures |
| Index with Included Columns | Single B-tree with additional data | Filters on key column; includes data for other columns | Lower, single structure            |

### Practical Example

Creating separate indexes in PostgreSQL:

```sql
CREATE INDEX idx_id ON employees(id);
CREATE INDEX idx_name ON employees(name);
```

Creating an index with included columns:

```sql
CREATE INDEX idx_id_include_name ON employees(id) INCLUDE (name);
```

A query like `SELECT name FROM employees WHERE id = 1000` can use the second index without accessing the heap, improving performance.

### Reflection

_Using included columns is a smart way to optimize specific queries without duplicating index structures. It’s a great example of how thoughtful index design can boost performance._

## Conclusion

This Q&A session was a goldmine of insights into database engineering. From understanding why **EXPLAIN ANALYZE** results vary to exploring Redis’s durability options, managing locks in transactions, and optimizing indexes, each topic deepened my appreciation for the complexity of databases. These concepts aren’t just theoretical—they directly impact how I’ll approach database design and optimization in the future. Whether it’s running **VACUUM** to stabilize query performance or choosing the right Redis persistence mode, these lessons will guide my decisions as I continue learning about databases.
