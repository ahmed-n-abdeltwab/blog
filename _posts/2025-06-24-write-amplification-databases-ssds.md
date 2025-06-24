---
layout: article
title: "Understanding Write Amplification in Databases and SSDs"
date: 2025-06-24
modify_date: 2025-06-24
excerpt: "This lecture explores write amplification across application, database, and storage levels, highlighting its impact on performance and hardware longevity."
tags:
  [
    "Database",
    "Performance",
    "SSDs",
    "Write Amplification",
    "LectureNotes",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: write-amplification-databases-ssds
---

## Introduction

Have you ever noticed your database slowing down for what seems like a simple update? Or wondered why your SSD doesn’t last as long as you expected? The culprit might be **write amplification**, a concept I hadn’t fully grasped until this lecture. It’s fascinating—and a bit alarming—how a single action can trigger a cascade of operations behind the scenes, affecting everything from app performance to hardware durability.

This lecture dives deep into write amplification, breaking it down into three levels: _application_, _database_, and _storage_ (SSDs). We’ll look at what causes it, how it impacts systems, and what we can do to reduce it. A real-world example stood out: Uber’s decision to switch databases partly because of write amplification issues in PostgreSQL. It’s a reminder that even tech giants face these challenges.

_The key insight_ for me was realizing that a single logical write, like updating a number in a database, can lead to hundreds of physical writes across the system. This not only slows things down but also wears out SSDs faster. Understanding this has made me rethink how I design and optimize code.

## Core Concepts

### What is Write Amplification?

**Write amplification** is when a single logical write operation—like updating a field in a database—results in many more physical write operations on the storage system. This can be thousands of times more writes than expected, causing slower performance, higher storage use, and faster wear on hardware, especially SSDs. The lecture explains this happens at three levels, each adding its own layer of complexity.

### Three Tiers of Write Amplification

1. **Application Write Amplification**

   - **What Happens**: When an app performs a simple task, it might trigger multiple database operations. For example, in a to-do app, marking a task as “done” could update the task table, add a record to an archive table, and adjust a counter table.
   - **Why It Matters**: This is common in apps with complex logic or databases with many tables, like relational databases with normalized data. It can slow down user actions and increase database load.
   - _Reflection_: I’ve worked on apps where we added features without considering these extra writes. Now, I see why those “small” changes caused performance issues.

2. **Database Write Amplification**

   - **What Happens**: Inside the database, a single update can create multiple internal operations. In PostgreSQL, for instance, updating a row creates a new row (called a tuple) and updates all related indexes, even if only one field changes. This might also involve other structures like toast tables (for large data) or write-ahead logs.
   - **Why It Matters**: These hidden operations increase the write workload, especially if a table has many indexes or is nearly full. PostgreSQL tries to reduce this with features like “heap only tuple” (HOT), but it’s not always enough.
   - _Reflection_: I was surprised to learn how much work a database does for a single update. It makes me appreciate why database tuning is so important.

3. **SSD Write Amplification**
   - **What Happens**: SSDs store data in pages and blocks. Updating data means marking old pages as “stale” and writing new data to new pages. This triggers garbage collection (moving active data and erasing old blocks) and wear leveling (spreading writes evenly), both of which add more writes.
   - **Why It Matters**: Updates are particularly harmful to SSDs, as they create stale pages and shorten the drive’s lifespan. The lecture explains that SSDs can’t overwrite data directly, making updates costly.
   - _Reflection_: I hadn’t realized how SSDs work at this level. It’s a wake-up call to think about hardware when writing code.

### Technical Details of SSDs

SSDs use cells to store data as electron levels, organized into pages and blocks. Writing to a page is easy if it’s empty, but updating data requires erasing an entire block, which is slow and complex. This leads to extra operations like garbage collection and wear leveling, amplifying writes.

| Component | Description                                                    | Impact on Write Amplification                              |
| --------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| **Cell**  | Stores data as electron levels (e.g., 4 bits per cell).        | Determines storage density but not directly amplification. |
| **Page**  | Smallest unit for writing data. Can’t be overwritten directly. | Updates create stale pages, triggering more writes.        |
| **Block** | Group of pages. Must be erased entirely to rewrite.            | Erasing blocks for updates increases write operations.     |

## Practical Implementations/Examples

### To-Do App Example

The lecture uses a to-do app to illustrate application write amplification. When a user marks a task as “done” via an API call, the backend might:

- Update the task’s status in the main table.
- Insert a record into an archive table.
- Update a counter table for completed tasks.

This shows how a single user action can lead to multiple writes, especially in apps with complex logic.

### PostgreSQL’s Update Process

In PostgreSQL, updating a row creates a new tuple and updates all indexes, even for small changes. For example:

- Changing a single column in a row with five indexes means updating the row and all five indexes.
- If the table uses toast tables for large data, additional writes may occur.

PostgreSQL’s “heap only tuple” (HOT) feature helps by avoiding index updates for certain cases, but it’s not a complete fix.

### SSD Behavior

The lecture describes how SSDs handle updates. If a block has pages A, B, C, and D, and you update page A:

- Page A is marked stale, and the new data is written to a new page.
- Eventually, garbage collection moves active pages (B, C, D) to a new block and erases the old one.

This process amplifies writes and wears out the SSD faster.

### Mitigation with Log-Structured Merge Trees (LSMT)

To reduce write amplification, the lecture suggests using **log-structured merge trees (LSMT)**. Unlike traditional B-trees, which require in-place updates, LSMT uses append-only operations. This aligns better with SSDs, as it:

- Avoids creating stale pages.
- Reduces the need for garbage collection.
- Extends SSD lifespan.

_Reflection_: Learning about LSMT was eye-opening. I want to explore how databases like RocksDB use it to improve performance.

### Uber’s Database Migration

The lecture mentions Uber’s switch from PostgreSQL to MySQL’s MyISAM engine, partly due to PostgreSQL’s write amplification issues. While controversial—some argue Uber overlooked other factors—it shows how write amplification can drive major decisions. For more details, see Uber’s engineering blog ([Uber Engineering](https://www.uber.com/en-AU/blog/engineering/)).

## Conclusion

This lecture opened my eyes to the hidden costs of write amplification across applications, databases, and storage. A single logical write, like updating a number, can trigger thousands of physical writes, slowing systems and wearing out SSDs. The three tiers—application, database, and SSD—each add their own challenges, but understanding them is the first step to optimization.
