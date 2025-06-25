---
title: "Why SELECT * Can Slow Down Your Database"
date: 2025-06-25
modify_date: 2025-06-25
excerpt: "A reflective note on how using `SELECT *` in SQL can introduce hidden performance costs and maintenance issues."
tags:
  [
    "Database",
    "SQL",
    "LectureNotes",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: true
key: select-star-performance
---

## Introduction

I remember a time when I deployed a backend API that ran queries in a few milliseconds, and then suddenly everything got slow. Turns out the culprit was a simple `SELECT *` in the code. We had a table with only two integer fields, but later someone added three large BLOB columns to it. Our code still did `SELECT *` even though it only needed the two integer fields. The database quietly fetched all those big BLOBs and sent them over the network, slowing everything down by hundreds of milliseconds.

That experience taught me to be very cautious with `SELECT *`. It might seem harmless—after all, a row-store database loads entire pages of data into memory anyway—but fetching all fields can trigger a chain of extra work. In this note, I’ll explain how and why selecting all columns can hurt performance. The key insight is that unnecessary columns mean wasted I/O, CPU, and network work. By the end, I realized it’s generally better to list only the columns I actually need.

## Core Concepts

A basic fact is that `SELECT *` returns all columns in a table. In a typical row-store database (like PostgreSQL), data is stored in fixed-size pages in memory. Each page holds many rows, and each row has its columns inline. When the database reads a page into the buffer, _all_ columns of all rows on that page become available in memory. This might make you wonder: if every column is already in memory, why would including them slow things down?

The answer is that even though the data is in memory, selecting extra columns forces additional work at multiple steps of the query pipeline. For example, the database optimizer can only use a fast index-only scan if the query doesn’t need any extra fields. Using `SELECT *` means the optimizer often has to go back to the full row data instead of staying in the index. In other words, retrieving unnecessary columns breaks certain optimizations.

Another concept is _deserialization_. When the database stores data on disk or sends it over the network, it’s in a compact byte form. To use it, the database (and later the client) must decode those bytes back into integers, strings, etc. If we select every column, the database must decode every column’s bytes even if our code doesn’t use them. That adds CPU cost.

Finally, not all columns are equal. Large columns (e.g., `TEXT` or `BLOB` fields) might not even be stored inline on the page. In PostgreSQL, for example, oversized columns can be stored in external “TOAST” tables and compressed. A `SELECT *` will fetch those fields from external storage and decompress them, even if they weren’t needed by the application. That means extra disk reads and CPU work on large data.

Taken together, these concepts explain why a seemingly simple `SELECT *` can quietly introduce overhead at the I/O, memory, and network level. The database has all the data on hand, but sending and processing it carries real cost.

## Key Characteristics

- **Index-only scans disabled:** When you use `SELECT *`, the optimizer often cannot use index-only scans. For example, if you only need student IDs for grades > 90, the database could just scan an index (e.g. `CREATE INDEX ON students(grade) INCLUDE (student_id)`) and return IDs without touching the table rows. But `SELECT *` forces it to load the full row from disk, causing extra random I/O.

- **Extra I/O for additional fields:** By asking for all columns, the database must fetch any extra columns from the table. This means more random reads. In our story, the three BLOB fields were much larger than the two integer fields. Pulling those BLOBs from storage made each query hundreds of milliseconds slower.

- **Deserialization overhead:** All selected columns must be decoded from raw bytes into usable data. If you don’t need a field, decoding it is wasted work. Only selecting needed columns reduces CPU decoding time and can noticeably speed up queries.

- **Large columns fetched out-of-line:** Some columns aren’t stored in the main page. Large text or blob columns may reside in secondary storage. A `SELECT *` with such columns forces extra reads and decompression from those external tables. Even columns that many queries don’t use can get loaded.

- **Network serialization:** Before results are sent to the client, they are packaged and sent over the network. More columns means more bytes to serialize and transfer. That increases CPU cost and network latency. In high-latency or bandwidth-limited environments, this extra data can slow down response times.

- **Client decoding:** After the server sends the data, the client must parse it. If the server returns extra columns, the client spends time converting those bytes into its own data structures, even if the code never uses them. More data means slower client-side processing too.

- **Unpredictability:** Using `SELECT *` can hide future performance risks. If the table schema changes and new columns are added (for example, adding an XML or JSON column later on), existing queries will suddenly include those new fields. Your code didn’t change, but the query slows down because it’s now dragging along data it didn’t anticipate.

- **Maintenance and clarity:** `SELECT *` makes the code less explicit. If you want to find all code that uses a particular column, a simple text search (“grep”) will miss the cases where `*` was used. Explicit column lists help keep track of which parts of the code rely on each field. This matters when renaming or dropping columns.

These points highlight why “avoiding `SELECT *`” is a common best practice. It improves performance and makes your code more predictable.

## Advantages & Disadvantages

**Advantages:**

- **Simplicity:** `SELECT *` is quick to write and ensures you get every column. For ad-hoc queries or development debugging, this is convenient.
- **Flexibility for ad-hoc tools:** Tools like database explorers or ORMs sometimes expect all fields. Using `*` can simplify quick investigations.
- **All-columns guarantee:** If a query really needs every field (rare in practice), `SELECT *` does it in one go without listing them.

**Disadvantages:**

- **Performance hit:** As we saw, selecting all columns can disable index optimizations, cause extra disk reads, extra CPU decoding, and more network traffic. All of this slows down query execution.
- **Unpredictable changes:** Adding a new column to the table can silently change query performance if `SELECT *` is used. A query that was once fast can become slow overnight.
- **Extra network and memory usage:** Returning unused columns wastes network bandwidth and client memory.
- **Code clarity:** It’s harder to see which columns a part of your application really uses. This makes refactoring or schema changes riskier.
- **Negligible gain:** In many cases, you only need a few columns. The time saved by not writing explicit column names is usually not worth the potential slowdown.

In summary, the main advantage of `SELECT *` is ease of use, but the disadvantages often outweigh it. Generally, it’s best to list exactly the fields you need.

## Practical Examples

Consider a simple table of student grades:

```sql
CREATE TABLE students (
  student_id INT,
  name TEXT,
  grade INT,
  comments TEXT   -- possibly large notes
);
```

Suppose we want only the IDs of students with grade above 90. A naive query might be:

```sql
SELECT * FROM students WHERE grade > 90;
```

This returns the entire row (ID, name, grade, comments) for each student above 90. If the `comments` column is large, we are pulling lots of unneeded data. Instead, we can write:

```sql
SELECT student_id, name
FROM students
WHERE grade > 90;
```

This lets the database use an index on `grade` and only fetch the `student_id` and `name` fields, skipping the large `comments` entirely.

Another example from my experience: We had a table that originally was:

```sql
CREATE TABLE example (
  a INT,
  b INT
);
```

Later, someone did:

```sql
ALTER TABLE example
  ADD COLUMN doc1 BYTEA,
  ADD COLUMN doc2 BYTEA,
  ADD COLUMN doc3 BYTEA;
```

Our code was still doing `SELECT *`:

```sql
SELECT * FROM example;
```

Even though our code only used `a` and `b`. This query became slow after adding the `doc` columns because each row suddenly carried 3 large blob columns. The fix was simply:

```sql
SELECT a, b FROM example;
```

Now the query skips the blob fields altogether, which restored the speed. I learned that explicitly listing `a, b` made all the difference in avoiding I/O on the new columns.

Finally, for maintenance: if I know which columns I need, I can easily search my code. For example, if I plan to rename `name` to `full_name`, I can search for `"name"` in my SQL queries. But if I had used `SELECT *`, I might miss that the `name` column is still being implicitly used, leading to bugs. Being explicit helps with these schema changes.

## Conclusion

After diving into these examples and notes, I’ve realized how deceptively expensive `SELECT *` can be. It may feel convenient to pull all columns, but under the hood the database and network pay a price. Indexes can’t work as efficiently, more disk pages are read, more CPU time is spent decoding and compressing data, and the client has to handle extra fields. The result is slower queries and a maintenance headache if the schema changes.

Going forward, I’ll make it a habit to explicitly list the columns I need. Even on tables with just one or two columns now, that small discipline saves me from future surprises. In summary: `SELECT *` can hide hidden costs. By being selective, we keep queries fast and predictable. This lesson from my past will help me write leaner, more efficient SQL in the future.
