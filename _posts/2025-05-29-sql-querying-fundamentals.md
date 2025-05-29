---
layout: article
title: "SQL Querying Fundamentals: Databases for Real-World Data"
date: 2025-05-29
modify_date: 2025-05-29
excerpt: "Learn how databases solve modern data challenges through SQL querying, filtering, and aggregation using SQLite."
tags: ["SQL", "Database", "Querying", "SQLite", "Data Management", "CS50", "LectureNotes"]
mathjax: false
key: sql-querying-fundamentals
---

# SQL Querying Fundamentals: Databases for Real-World Data

## Introduction
> **Pain point**: We're drowning in data—Google searches, health metrics, social media—but spreadsheets choke on millions of records and real-time updates.  
> **Key revelation**: *Databases and SQL unlock scalable, efficient data management* for modern applications.  
> **Real-world failure**: Instagram or Twitter would collapse if built on spreadsheets—they handle millions of updates per second.

## Core Concepts

### Why Databases > Spreadsheets
1. **Scale**: Handle billions of records (vs. spreadsheet row limits)
2. **Speed**: Optimized search algorithms (vs. manual `Ctrl+F`)
3. **Concurrency**: Support frequent real-time updates (e.g., tweets/sec)

### Database Components
- **Database**: Organized data storage (create/read/update/delete)
- **DBMS**: Software to interact with databases (e.g., SQLite, PostgreSQL)
- **SQL**: Structured Query Language for database operations

### SQLite in Practice
- Lightweight DBMS used in mobile apps, websites, and embedded systems
- Trade-offs: Less features than PostgreSQL but faster for small-scale use

---

## Key SQL Operations

### 1. Retrieving Data

```sql
-- Basic structure
SELECT column1, column2 FROM table_name;

-- Get all books
SELECT title, author FROM longlist;

-- Preview first 5 rows
SELECT title FROM longlist LIMIT 5;
```

> `SELECT *` returns all columns. **Always quote identifiers** (`"title"`) and **strings** (`'hardcover'`).

### 2. Filtering Results

```sql
-- Equality filter
SELECT title FROM longlist WHERE year = 2023;

-- Pattern matching (case-insensitive)
SELECT title FROM longlist 
WHERE title LIKE '%love%';  -- % = wildcard

-- Combined conditions
SELECT title FROM longlist 
WHERE (year = 2022 OR year = 2023) 
AND format != 'hardcover';
```

> **Pro tip**: `LIKE` supports `_` for single-character wildcards (e.g., `P_re` matches "Pyre").

### 3. Handling Missing Data

```sql
-- Find books without translators
SELECT title FROM longlist WHERE translator IS NULL;

-- Exclude null values in counts
SELECT COUNT(translator) FROM longlist;  -- Ignores NULLs
```

### 4. Sorting & Limiting

```sql
-- Get top 10 highest-rated books
SELECT title, rating FROM longlist 
ORDER BY rating DESC LIMIT 10;

-- Break rating ties with votes
SELECT title, rating, votes FROM longlist 
ORDER BY rating DESC, votes DESC;
```

### 5. Aggregating Data

| Function      | Use Case                          | Example                          |
|---------------|-----------------------------------|----------------------------------|
| `COUNT()`     | Number of non-null values         | `SELECT COUNT(*) FROM longlist;` |
| `AVG()`       | Average of numerical column       | `SELECT AVG(rating) FROM longlist;` |
| `MAX()`/`MIN` | Highest/lowest value              | `SELECT MAX(rating) FROM longlist;` |
| `SUM()`       | Total of numerical column         | `SELECT SUM(votes) FROM longlist;` |
| `DISTINCT`    | Unique values                     | `SELECT DISTINCT publisher FROM longlist;` |

```sql
-- Rounded average rating with alias
SELECT ROUND(AVG(rating), 2) AS average_rating FROM longlist;
```

---

## Critical Insights
- **`NULL` ≠ empty string**: It signifies *absent data* (use `IS NULL`/`IS NOT NULL`).
- **Case sensitivity**: `WHERE title = 'pyre'` fails (exact match), but `LIKE 'pyre'` succeeds (case-insensitive).
- **Operator nuances**: 
  - `!=` and `<>` both mean "not equal"
  - `BETWEEN 2019 AND 2022` is inclusive
- **Aggregate caveats**: `COUNT(column)` excludes `NULL` values, while `COUNT(*)` counts all rows.

---

## Practical Examples

**Find short, highly-rated books:**

```sql
SELECT title, pages, rating FROM longlist 
WHERE pages < 300 AND rating > 4.0;
```

**Publisher diversity analysis:**

```sql
-- 33 unique publishers in dataset
SELECT COUNT(DISTINCT publisher) FROM longlist; 
```

**Top 3 longest book titles:**

```sql
SELECT title FROM longlist 
ORDER BY LENGTH(title) DESC LIMIT 3;  -- LENGTH() not covered but hinted
```

---

## Conclusion
- **Databases solve real-world data challenges** that spreadsheets can't handle (scale/speed/concurrency).
- **SQL provides declarative power**: Describe *what* you need, not *how* to get it.
- **Core fluency**: `SELECT`, `WHERE`, `ORDER BY`, and aggregates form 80% of daily querying.

> **Next session**: We'll evolve from single-table designs to *relational databases* (multiple linked tables).
