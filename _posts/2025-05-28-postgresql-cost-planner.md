---
layout: article
title: "Understanding Cost Units in PostgreSQL Query Planner"
date: 2025-05-28
modify_date: 2025-05-28
excerpt: "Lecture clarifying that PostgreSQL planner uses abstract cost units rather than milliseconds, with examples showing how costs reflect I/O and CPU work."
tags: ["PostgreSQL", "Query Planner", "Cost Units", "Database", "LectureNotes", "QA"]
mathjax: false
mathjax_autoNumber: false
key: postgresql-cost-planner
---

## Introduction

- **Pain point:** It is easy to misread PostgreSQL’s cost values as time in milliseconds, leading to wrong performance expectations.  
- **Overview:** In this lecture, we correct that misunderstanding and explain what these cost units really mean. We cover:
  1. What the cost unit represents  
  2. How the planner uses “cost to first row” and “cost to last row”  
  3. Simple examples with and without `ORDER BY`  
- **Key revelation:** _PostgreSQL’s cost values are abstract units_—a mix of estimated I/O and CPU effort—not real-time measurements.

> “It’s just a number. The higher the value, the higher the cost of the query.”  

## Core Concepts / Overview

- **Cost unit:** An internal, arbitrary measure combining logical I/O and CPU work.  
- **Estimation vs Actual:**  
  - The planner shows **estimated** cost for fetching rows.  
  - After execution, you can compare estimated cost to actual time taken.  

## Key Characteristics

- **Abstract measurement**  
  - Not tied to milliseconds.  
  - Allows the planner to rank different query plans.  
- **Cost to first row**  
  - Shows how much work before the first result appears.  
  - Important for queries with `LIMIT`.  
- **Cost to last row**  
  - Represents total estimated work to fetch all rows.  
- **Effect of sorting**  
  - An `ORDER BY` adds sorting cost on top of scans and appends.  
  - Sorting shows up as higher “first row” cost when planning.

## Practical Examples

1. **Simple table scan (no `ORDER BY`)**  
   ```sql
   EXPLAIN SELECT * FROM grades;
   ```

* Cost to first row: **0.00**
* Cost to last row: **21.00**
* Explanation: Reading partitions and appending rows without extra work.

2. **With `ORDER BY grade`**

   ```sql
   EXPLAIN SELECT * FROM grades ORDER BY grade;
   ```

   * Cost to first row: **70.00**
   * Cost to last row: **73.00**
   * Explanation:

     1. Read raw rows (cost \~0)
     2. Sort all rows (adds \~70 units)
     3. Return sorted rows (final cost \~73 units)

## Conclusion

* PostgreSQL’s **cost units** are a planner’s abstract way to compare query plans.
* They **do not** equal time; they reflect combined I/O and CPU estimates.
* Always focus on **relative** cost values when tuning queries.
* After running queries, compare **estimated** vs **actual** to spot outdated statistics or need for `ANALYZE`.
