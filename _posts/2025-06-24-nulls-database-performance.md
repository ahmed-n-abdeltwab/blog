---
layout: article
title: "Understanding NULLs in Database Queries and Their Impact on Performance"
date: 2025-06-24
modify_date: 2025-06-24
excerpt: "Exploring NULLs in databases, their storage in PostgreSQL using null bitmaps, and their impact on query performance, with practical tips for optimization."
tags:
  [
    "Database",
    "SQL",
    "PostgreSQL",
    "LectureNotes",
    "Performance",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: true
mathjax_autoNumber: true
key: nulls-database-performance
---

## Understanding NULLs in Database Queries and Their Impact on Performance

As someone diving deeper into databases, I’ve always found NULLs intriguing yet confusing. What are they, and how do they affect my queries? In a lecture by Hussein Nasser on [The Backend Engineering Show](https://www.youtube.com/watch?v=iSwJI00Rv2s), I gained clarity. Hussein explains, "Null is a very interesting thing because it is a representation of something that is missing." This lecture unpacks NULLs, their storage, and their role in query performance, focusing on PostgreSQL.

The lecture covers NULL’s definition, how databases like PostgreSQL store them, and their impact on performance. Through examples, Hussein highlights NULLs’ benefits and challenges. For instance, imagine a user database where some people haven’t shared their birthdays. NULLs represent this absence accurately, avoiding fake values like '0000-00-00' that could skew analysis. As Hussein notes, "We absolutely need nulls."

A key takeaway was that NULLs can boost performance by shrinking row sizes, fitting more rows into disk pages, and reducing I/O operations. "If you can fit more rows into a page, that definitely is better than fitting less rows into a page," Hussein says. This insight reshaped how I view NULLs in database design.

## What is NULL?

NULL represents missing or unknown data in a database. It’s not a value but a marker indicating no data exists in a field. The lecture emphasizes, "It's the value and SQL standard hates when you call null a value because it's not really a value. There is no value there." This distinction affects storage and query execution, making NULLs a unique aspect of SQL.

## How are NULLs Stored?

In PostgreSQL, NULLs are stored using a null bitmap, where each bit indicates whether a column is NULL. Hussein explains, "Postgres have this idea of a null bitmap that it adds in front of every row in the page." A single byte (8 bits) can track up to eight columns, with additional bytes for more columns. This adds a small overhead but saves space by not storing data for NULL fields.

For tables with many columns—especially if many are NULL—this reduces row size significantly. Smaller rows mean more can fit into a disk page (typically 8KB in PostgreSQL), reducing disk reads and improving query speed. This storage efficiency is a major advantage in large datasets.

## Key Characteristics of NULLs

NULLs behave uniquely in SQL, requiring careful handling:

- **Comparison**: You can’t use standard operators like `=`. Instead, use `IS NULL` or `IS NOT NULL`. Hussein warns, "You cannot compare nulls together. You cannot do hey where field t is equal to null because that based on the SQL standard null is not really a value."

  Example:

  ```sql
  SELECT * FROM table_name WHERE column_name IS NULL;
  ```

- **Aggregation**: Functions like `COUNT` treat NULLs differently. `COUNT(*)` includes all rows, while `COUNT(column_name)` skips NULLs. "If you do a select star from test the table, that the rows that will be counted are pretty much all the rows. However, if you do select count and you provide the column. Then. Based on the SQL standard. It is designed to actually ignore nulls for you, which is absolutely freaky."

- **Inconsistent Semantics**: NULLs can cause unexpected query results, especially in `IN` clauses. The lecture notes, "The nulls semantics are almost always inconsistent."

## Advantages of Using NULLs

- **Accurate Data Representation**: NULLs reflect missing or inapplicable data, like an optional birthday field. Hussein illustrates, "One of the things that are useful is that. Hey, hey, there's a birthday column. I don’t wish to disclose my birthday... So you want to store a null, an explicit null in a birthday right field or a date field in general."

- **Space Efficiency**: By not storing data for NULL columns, databases save storage, especially in “fat tables” with many columns.

- **Performance Improvement**: Smaller rows enhance cache usage and reduce I/O, speeding up queries. "So now we talked about the smaller the rows, the, the more rows you can cram into a page and, and with a single read I o you get a lot of rows and that's pretty, that's beautiful."

## Disadvantages of Using NULLs

- **Query Complexity**: NULLs require special syntax, increasing the risk of errors in queries.

- **Potential Performance Issues**: Without proper indexing, NULL-related queries can be slow. Some databases, like Oracle, don’t index NULLs by default, unlike PostgreSQL (since version 8.3).

- **Database-Specific Behaviors**: NULL handling varies, complicating portability across systems like Oracle and PostgreSQL.

## Practical Implementations and Examples

The lecture provides SQL examples to show NULL behavior:

1. **Counting Rows**:
   - `SELECT COUNT(*) FROM test_table;` counts all rows, including NULLs.
   - `SELECT COUNT(column_name) FROM test_table;` counts only non-NULL rows.

2. **Finding NULL Values**:
   - Correct: `SELECT * FROM table_name WHERE column_name IS NULL;`
   - Incorrect: `SELECT * FROM table_name WHERE column_name = NULL;` (returns no rows).

3. **Using NULL in `IN` Clauses**:
   - NULLs in `IN` clauses can lead to unexpected results, requiring caution.

For performance, partial indexes can exclude NULLs, reducing index size. Hussein advises, "If you are not going to query that table based on and that column based on these null values you don’t care about... Then what you can do is create the index. A partial index says, Hey, I want this index and don’t index on null."

Example in PostgreSQL:

```sql
CREATE INDEX idx_non_null ON table_name (column_name) WHERE column_name IS NOT NULL;
```

This optimizes queries filtering non-NULL values, improving speed for user-facing applications.

## Storage Impact Table

| Aspect                | With NULLs                          | Without NULLs                       |
|-----------------------|-------------------------------------|-------------------------------------|
| **Storage Overhead**  | Null bitmap (e.g., 1 byte/8 columns)| Full data storage (e.g., 4 bytes for int) |
| **Row Size**          | Smaller if many NULLs              | Larger, stores default values       |
| **Performance**       | Faster I/O with more rows/page     | Slower if rows exceed page capacity |
| **Query Complexity**  | Higher, special syntax needed      | Lower, standard comparisons work    |

## Conclusion

NULLs are a double-edged sword in databases. They ensure accurate data representation and can enhance performance through storage efficiency, but their inconsistent behavior demands careful query design and indexing. This lecture clarified how NULLs work, especially in PostgreSQL, and offered practical strategies like partial indexing.
