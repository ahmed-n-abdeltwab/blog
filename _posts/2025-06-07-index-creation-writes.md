---
layout: article
title: "Understanding Index Creation and Write Operations in Databases"
date: 2025-06-07
modify_date: 2025-06-07
excerpt: "A lecture on how database index creation affects write operations and the benefits of concurrent indexing."
tags:
  [
    "Database",
    "Indexing",
    "PostgreSQL",
    "LectureNotes",
    "Q&A",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
key: index-creation-writes
---

## Understanding Index Creation in Databases: Does It Block Writes?

## Introduction

Have you ever wondered why creating an index in a database can sometimes halt your operations? Or perhaps you've encountered situations where you needed to add an index without disrupting ongoing writes. In a recent lecture, we explored the intricacies of database indexing, specifically addressing whether creating an index blocks write operations and why.

The lecture covered the basics of indexing, the challenges of concurrent edits during index creation, and introduced PostgreSQL's `CREATE INDEX CONCURRENTLY` as a solution. We also discussed the trade-offs and practical considerations of using this feature. A real-world example involved creating an index on the "salary" column of an employee table, which helped illustrate the concepts. _The key revelation for me was understanding why standard index creation blocks writes to prevent data corruption and how concurrent indexing allows continuous operations at the cost of performance._

## Core Concepts/Overview

An **index** in a database is a data structure, typically a B+ tree, designed to improve the speed of data retrieval operations on a table. It stores the values of one or more columns in an organized way, allowing the database to quickly locate rows based on those values. For example, an index on a "salary" column lets the database find employees with specific salaries without scanning the entire table.

When you execute a `CREATE INDEX` command, the database reads all values in the specified columns to build the index. In a transactional system (like an online transaction processing system, or OLTP), where tables are constantly modified with inserts, updates, or deletes, simultaneous edits during index creation can cause issues. If a new row is added while the index is being built, it might not be included, leading to data corruption.

## Key Characteristics

### Standard `CREATE INDEX`

- **Blocks all write operations** (inserts, updates, deletes) during index creation to ensure data consistency.
- Allows read operations, so users can still query the table.
- Builds the index on a consistent snapshot of the data, preventing corruption but causing potential downtime.

### Concurrent Index Creation (`CREATE INDEX CONCURRENTLY`)

- Allows writing operations to continue while the index is being created, making it ideal for production environments.
- More complex and slower, often requiring multiple table scans and updates to account for changes.
- Uses mechanisms like **write-ahead logs** or log sequence numbers to track and apply changes during the process.

## Advantages & Disadvantages

| **Method**                      | **Advantages**                                | **Disadvantages**                                 |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| **Standard `CREATE INDEX`**     | Faster index creation, simpler implementation | Blocks write operations, disruptive in production |
| **`CREATE INDEX CONCURRENTLY`** | No downtime for writes, continuous operation  | Slower, more complex, may take longer to complete |

### Standard `CREATE INDEX`

- **Advantages**: The process is straightforward and faster because it locks the table and builds the index in one pass. This is ideal for non-production environments or when downtime is acceptable.
- **Disadvantages**: Blocking writes can be highly disruptive in live systems, such as e-commerce platforms, where continuous updates are critical. For large tables, this can lead to hours of downtime.

### `CREATE INDEX CONCURRENTLY`

- **Advantages**: By allowing writes, it ensures minimal disruption, making it suitable for high-traffic databases where uptime is crucial.
- **Disadvantages**: The process is almost twice as slow due to multiple table scans and the need to track changes. It’s also more complex, as the database must continuously update the index to reflect modifications.

## Practical Implementations/Examples

The lecture provided a clear example: creating an index on the "salary" column of an employee table. With a standard `CREATE INDEX`, the database locks the table for writes, reads all salary values, and builds a B+ tree where salaries are keys and row pointers are values. During this time, no new employees can be added, salaries updated, or employees deleted, which could be problematic in a live system like a payroll application.

In contrast, `CREATE INDEX CONCURRENTLY` allows ongoing modifications. The database starts by taking a snapshot of the table, builds the initial index, and then iteratively checks for changes (e.g., a new employee added) using the write-ahead log. It applies these changes to the index until no further modifications are detected, ensuring the index is complete and accurate. This approach, while slower, prevents downtime, which is critical in production environments.

The lecturer also suggested a theoretical implementation: take a snapshot using a log sequence number, build the index, and then apply any changes (or "diffs") that occurred during the process. This iterative approach ensures consistency but can be time-consuming if the table is heavily modified.

## Conclusion

In summary, standard `CREATE INDEX` operations block write operations to ensure data consistency, which can be disruptive in active systems. PostgreSQL’s `CREATE INDEX CONCURRENTLY` offers a solution by allowing writes to continue, though it’s slower and more complex due to the need to track and apply changes. _This balance between performance and availability is a key consideration for database administrators._
