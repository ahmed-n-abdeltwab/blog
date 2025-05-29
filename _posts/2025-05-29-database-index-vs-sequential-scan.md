---
layout: article
title: "Why Databases Might Ignore Indexes: A Lesson from Karate’s Question"
date: 2025-05-29
modify_date: 2025-05-29
excerpt: "A look at why PostgreSQL skips indexes for small tables and how outdated statistics can slow down queries after big data inserts."
tags: ["Database", "Query Optimization", "Indexes", "PostgreSQL", "LectureNotes", "QA"]
mathjax: false
mathjax_autoNumber: false
key: database-index-vs-sequential-scan
---

# Why Databases Might Ignore Indexes: A Lesson from Karate’s Question

## Introduction

It’s annoying when you set up an index to speed up your database queries, but the database ignores it and scans the whole table instead. That’s the pain point Karate, a student, brought up in this lecture. He asked: *Why is PostgreSQL using a sequential scan instead of my index?* This session explains why that happens and how to avoid slow queries.

The lecture’s goal is to show how databases decide between **index scans** and **sequential scans**, especially for small tables. It also covers a real-world failure: the lecturer’s own story of slow queries after adding millions of rows. The key revelation? Sometimes, skipping the index is faster, but you need to watch out for outdated stats.

## Core Concepts/Overview

Databases like PostgreSQL use a **planner** to pick the fastest way to run a query. Karate made a table with 7 rows and an index on the ID column. He ran:  
`SELECT ID FROM table_name WHERE ID = value;`  
But instead of using the index, PostgreSQL did a **sequential scan**—reading the whole table.

Why? The table is tiny—just 7 rows, fitting in one 8KB page. The planner knows it’s quicker to grab that page than to load and search the index’s B-tree structure. For big tables, indexes win, but for small ones, sequential scans are simpler.

## Key Characteristics

### Why Sequential Scans Happen

- **Small Tables**: If the table fits in one or a few pages, reading it all is faster than using an index.
- **Index Overhead**: Loading and searching the index (a B-tree) takes extra steps—too much work for 7 rows.
- **Outdated Statistics**: The planner uses stats (like row count) to decide. If stats aren’t updated after adding lots of data, it might think the table is still small and pick a sequential scan.

### How the Planner Works

- It estimates the **cost** of each option: sequential scan vs. index scan.
- For Karate’s 7-row table, the sequential scan cost is almost zero—one page, one read.
- For big tables, index scans cost less because they skip irrelevant data.

## Advantages & Disadvantages

### Sequential Scan

- **Advantages**:
  - Fast and simple for small tables (like 7 rows).
  - No need to load or search an index.
- **Disadvantages**:
  - Slow for big tables—reads everything, even unneeded rows.

### Index Scan

- **Advantages**:
  - Great for large tables—finds specific rows quickly.
- **Disadvantages**:
  - Extra work for small tables (loading B-tree, traversing it).

## Practical Implementations/Examples

### Real-World Example: 3 Million Rows Mess

The lecturer shared a story:
- He had a small table and queried it—sequential scans worked fine.
- Then he added 3 million rows but didn’t update the stats.
- Queries got super slow because the planner still thought the table was small and kept doing sequential scans over thousands of pages.
- Fix? Update the stats so the planner switches to an index scan.

### How to Update Stats

- **PostgreSQL**: Run `VACUUM` or `ANALYZE` to refresh stats.
- **Oracle**: Use `GATHER_SCHEMA_STATS`.
- **SQL Server**: Use `UPDATE STATISTICS`.

> “After inserting a lot of data, you have to do a vacuum in PostgreSQL... so the planner will make smarter decisions.”

## Conclusion

This lecture was eye-opening. Key takeaways:
- Small tables (like Karate’s 7 rows) don’t need indexes—sequential scans are faster.
- After big data inserts, update stats or the planner might pick the wrong plan, slowing things down.
- Always check query plans to see what the database is really doing.

I’ll remember to keep stats fresh and not assume an index is always used. Smart stuff from Karate’s question!
