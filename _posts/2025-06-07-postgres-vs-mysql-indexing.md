---
layout: article
title: "Understanding Postgres vs MySQL: Key Differences in Indexing and Data Management"
date: 2025-06-07
modify_date: 2025-06-07
excerpt: "Exploring the fundamental differences between Postgres and MySQL, focusing on indexing strategies and their impact on performance."
tags: 
  [
    "Database",
    "Postgres",
    "MySQL",
    "Indexing",
    "Performance",
    "LectureNotes",
    "Q&A",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: postgres-vs-mysql-indexing
---

## Postgres vs MySQL: Understanding the Fundamental Differences

## Introduction

Choosing between PostgreSQL and MySQL can feel overwhelming, especially when you're unsure how their technical differences affect your application. This lecture dives into the key distinctions between these two popular databases, focusing on their indexing strategies, data storage, and how they handle queries and updates. By understanding these differences, you can make a smarter choice for your project.

The lecture started with a question from a Q&A session about how PostgreSQL and MySQL differ, which led to a detailed exploration. It uses a simple table example with columns PK (primary key), C1, and C2 (with a secondary index on C2) to show how each database performs. The _key insight_ is that MySQL uses a clustered primary index, where the data is part of the index, while PostgreSQL uses a heap with secondary indexes pointing to tuple IDs. This fundamental difference impacts query speed, update efficiency, and more.

## Core Concepts/Overview

The lecture compares PostgreSQL and MySQL across several technical areas:

- **Indexing**: MySQL stores data in a **primary index** (clustered index), while PostgreSQL uses a **heap** with **secondary indexes** pointing to tuple IDs.
- **Query Performance**: MySQL is better for **range queries** (e.g., selecting a range of primary keys), while PostgreSQL excels at **single-row lookups** using secondary indexes.
- **Updates**: MySQL updates data in place, which is often faster, while PostgreSQL creates new tuples, which can require more I/O operations.
- **Multi-Version Concurrency Control (MVCC)**: MySQL uses **undo logs** to manage concurrent transactions, while PostgreSQL creates new tuple versions and uses a **Vacuum** process for cleanup.
- **Architecture**: MySQL uses **threads**, which are lightweight, while PostgreSQL uses **processes**, which have higher overhead but offer different scalability benefits.

## Key Characteristics

Here are the main differences between PostgreSQL and MySQL, broken down into key areas:

- **Index Structure**:

  - **MySQL**: Uses a **clustered primary index**, where the table data is stored in the index itself. Secondary indexes point to the primary key.
  - **PostgreSQL**: Uses a **heap-organized** structure with all indexes as secondary, pointing to system-managed tuple IDs (tids).

- **Data Organization**:

  - **MySQL**: Data is ordered by the primary key, making range queries efficient.
  - **PostgreSQL**: Data is stored in an unordered heap, requiring additional I/O to locate rows.

- **Query Performance**:

  - **MySQL**: Excels in **range queries** (e.g., `SELECT * FROM T WHERE PK BETWEEN 1 AND 3`) due to ordered data.
  - **PostgreSQL**: More efficient for **single-row lookups** (e.g., `SELECT * FROM T WHERE C2 = 'x2'`) with fewer index lookups.

- **Updates**:

  - **MySQL**: Updates data in place, typically requiring fewer I/Os.
  - **PostgreSQL**: Creates new tuples for updates, which may update all secondary indexes, increasing I/O.

- **MVCC**:

  - **MySQL**: Uses **undo logs** to track changes, which can slow down long transactions or crash recovery.
  - **PostgreSQL**: Creates new tuple versions with transaction IDs, avoiding undo logs but requiring a **Vacuum** process to clean up old tuples.

- **Architecture**:
  - **MySQL**: Thread-based, lighter and sharing memory.
  - **PostgreSQL**: Process-based, with higher memory overhead but different isolation benefits.

## Advantages & Disadvantages

### MySQL

- **Advantages**:
  - Efficient for **range queries** and **primary key lookups** due to its clustered index.
  - Simpler **updates** with fewer I/O operations for non-indexed columns.
  - **Thread-based architecture** reduces memory overhead, making it lightweight.
- **Disadvantages**:
  - **Secondary index lookups** require two steps (secondary to primary index), increasing query cost.
  - **Undo logs** can slow down long transactions and crash recovery, as seen in a case where recovery took over an hour ([Database Recovery Issues](https://www.mysql.com)).
  - **Primary key data type** (e.g., UUID) can bloat secondary indexes, impacting performance.

### PostgreSQL

- **Advantages**:
  - More efficient for **single-row lookups** via secondary indexes, requiring only one lookup plus one I/O.
  - **No index bloat** from large primary keys, as secondary indexes use fixed 4-byte tuple IDs.
  - **Flexible MVCC** avoids undo logs, simplifying short transactions ([PostgreSQL MVCC](https://www.postgresql.org/docs/current/mvcc.html)).
- **Disadvantages**:
  - Poor performance for **range queries** and **update-heavy workloads** due to random heap reads.
  - Higher **write I/O** for updates, as secondary indexes may need updating (though mitigated by **HOT** optimization).
  - **Process-based architecture** adds memory and control block overhead compared to threads.

## Practical Implementations/Examples

The lecture uses a table "T" with columns **PK** (integer, primary key), **C1** (text, no index), and **C2** (text, secondary index) to demonstrate differences:

- **Query 1**: `SELECT * FROM T WHERE C2 = 'x2'`

  - **MySQL**: Requires two lookups: first in the secondary index to find the primary key, then in the primary index to get the full row. This can involve multiple I/Os.
  - **PostgreSQL**: Needs one lookup in the secondary index to get the tuple ID, followed by one I/O to fetch the row from the heap. This is often faster but can slow down with many duplicates.

- **Query 2**: `SELECT * FROM T WHERE PK BETWEEN 1 AND 3`

  - **MySQL**: Efficiently walks linked leaf pages in the primary index to retrieve consecutive rows, minimizing I/O.
  - **PostgreSQL**: Requires collecting tuple IDs from the secondary index and performing random reads on the heap, which can be slower, especially with frequent updates.

- **Update Example**: `UPDATE T SET C1 = 'XX1' WHERE PK = 1`
  - **MySQL**: Updates the row in the primary index’s leaf page, with no changes to secondary indexes if the primary key remains unchanged.
  - **PostgreSQL**: Creates a new tuple, potentially updating all secondary indexes to point to the new tuple ID, increasing I/O. The **HOT** optimization can reduce this overhead by linking old and new tuples.

### Example Table

| Query/Update                               | MySQL                             | PostgreSQL                 |
| ------------------------------------------ | --------------------------------- | -------------------------- |
| `SELECT * FROM T WHERE C2 = 'x2'`          | Two lookups (secondary → primary) | One lookup + one heap I/O  |
| `SELECT * FROM T WHERE PK BETWEEN 1 AND 3` | Efficient sequential access       | Random heap reads, slower  |
| `UPDATE T SET C1 = 'XX1' WHERE PK = 1`     | Updates single page               | New tuple, updates indexes |

## Conclusion

The lecture makes it clear that neither PostgreSQL nor MySQL is the "best" database—it depends on your application's needs. If your app involves many **range queries** or frequent **updates**, MySQL’s clustered index and simpler update mechanism might be better. If you need fast **single-row lookups** or flexibility with data types, PostgreSQL’s heap-based structure and efficient MVCC could be the way to go. The lecturer advises analyzing your workload—whether it’s read-heavy, update-heavy, or involves specific query patterns—to make the right choice.
