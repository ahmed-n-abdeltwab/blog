---
layout: article
title: "Database Logs: WAL, Redo, and Undo Logs Explained"
date: 2025-06-07
modify_date: 2025-06-07
excerpt: "A summary of Hussein Nasr's lecture from The Back End Engineering Show, discussing the role of Write-Ahead Logs (WAL), redo logs, and undo logs in ensuring database durability and crash recovery."
tags:
  [
    "Database",
    "LectureNotes",
    "WAL",
    "Redo Logs",
    "Undo Logs",
    "Database Discussions",
    "Hussein Nasser",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: database-logs-wal-redo-undo
---

## Understanding Database Logs: WAL, Redo, and Undo Logs

## Introduction

Imagine losing all your important data due to a system crash. That’s a nightmare for any database administrator or developer. I recently studied a lecture from the "Back End Engineering Show" hosted by Hussein Nasser, which dives into how databases prevent such disasters using logs, specifically **Write-Ahead Logging (WAL)**, **redo logs**, and **undo logs**. These mechanisms ensure that transactions are either fully committed or completely rolled back, even if the system fails unexpectedly.

The lecture provides insights into how databases like [PostgreSQL](https://www.postgresql.org/), [MySQL](https://www.mysql.com/), and [Oracle](https://www.oracle.com/database/) use these logs to maintain data integrity. _The key revelation for me was that logs are the backbone of database reliability_, ensuring that no data is lost and that the system remains consistent, no matter what happens.

## Core Concepts/Overview

### Write-Ahead Logging (WAL) / Redo Log

**WAL**, also known as the redo log, is a method where changes to the database (like updates or inserts) are recorded in a log before they are applied to the actual database files. This “write-ahead” approach makes the log the source of truth. If a crash occurs, the database can use the WAL to “redo” the changes, ensuring that committed transactions are not lost. By writing changes to the log first, databases can keep modified data (called dirty pages) in memory longer, which improves performance.

### Undo Log

The **undo log** records the state of data _before_ changes are made. This allows the database to revert to previous states if a transaction needs to be rolled back, which is crucial for maintaining consistency, especially during long-running transactions or when multiple users access the database simultaneously. Interestingly, not all databases use undo logs. For example, PostgreSQL uses a versioning approach where old data rows are kept alongside new ones, while MySQL and Oracle rely on undo logs to store the “before” image of data.

## Key Characteristics

### WAL/Redo Log

- **Compact Storage**: Only stores changes, not entire pages, making it efficient.
- **Immediate Disk Write**: Changes are persisted to disk upon transaction commit using `fsync`, bypassing operating system caches for reliability.
- **Checkpointing**: Periodically, WAL changes are applied to data files, and the log is purged to save space. This process is resource-intensive and requires careful management.

### Undo Log

- **Before Images**: Stores the state of data before modifications, enabling rollbacks.
- **Consistency Support**: Provides consistent views for transactions, especially for different isolation levels (e.g., ensuring older transactions see data as it was before new changes).
- **Resource Intensive**: Can consume significant space and processing power, especially for long-running transactions.

| Log Type     | Purpose                            | Key Feature                    | Example Databases         |
| ------------ | ---------------------------------- | ------------------------------ | ------------------------- |
| WAL/Redo Log | Records changes before application | Persisted to disk with `fsync` | PostgreSQL, MySQL, Oracle |
| Undo Log     | Stores data state before changes   | Enables transaction rollbacks  | MySQL, Oracle             |

## Advantages & Disadvantages

### Advantages

- **Durability and Recovery**: WAL ensures that committed transactions are safe, even after a crash, by allowing the database to redo changes. Undo logs ensure uncommitted transactions can be rolled back, maintaining consistency.
- **Performance Optimization**: By writing to logs first, databases can delay writing to data files, keeping modified data in memory for faster operations.

### Disadvantages

- **Complexity in Management**: Configuring log sizes and checkpoint frequency involves trade-offs. A smaller WAL means more frequent checkpoints, which can slow down the system, while a larger WAL saves space but delays recovery.
- **Performance Overhead**: Frequent `fsync` operations for WAL can impact performance, as they force immediate disk writes. Undo logs can also be resource-heavy for long-running transactions, as the database must maintain and access old data states.

## Practical Implementations/Examples

The lecture highlights how different databases implement these logs:

- **PostgreSQL**: Relies heavily on WAL, using `fsync` to ensure changes are written to disk immediately. Instead of undo logs, it uses a versioning system where old and new data rows coexist, which simplifies some aspects of transaction management but requires careful space management.
- **MySQL and Oracle**: Use both redo and undo logs. Redo logs (similar to WAL) capture the final state of changes, while undo logs store the “before” state for rollbacks and consistent reads.
- **Checkpointing Trade-offs**: The lecture emphasizes that database administrators must balance WAL size and checkpoint frequency. A smaller WAL leads to more frequent but less resource-intensive checkpoints, while a larger WAL delays checkpoints but risks space and performance issues.

For example, in PostgreSQL, when a transaction commits, the changes are written to the WAL and persisted to disk. If the system crashes, the database reads the WAL to apply any missing changes to the data files. If an uncommitted transaction exists, the undo log (or versioning in PostgreSQL) ensures that those changes are rolled back, keeping the database consistent.

## Conclusion

Database logs like WAL, redo logs, and undo logs are critical for ensuring data durability and consistency. WAL guarantees that committed transactions are recoverable by logging changes before they’re applied, while undo logs allow the database to revert uncommitted changes, supporting transaction rollbacks and concurrent access. These mechanisms are implemented differently across databases like PostgreSQL, MySQL, and Oracle, but they all aim to balance performance and reliability.

_Personal Reflection:_ Taking these notes has opened my eyes to the complexity behind database reliability. I used to think databases just “saved” data, but now I see how much work goes into ensuring nothing is lost, even during a crash. _The balance between performance and safety is fascinating_, and I’ll definitely keep these logging strategies in mind when working on database-related projects. Understanding how logs work feels like peeking under the hood of a car—it’s complex, but it makes you appreciate the engineering that keeps everything running smoothly.
