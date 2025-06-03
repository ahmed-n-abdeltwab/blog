---
layout: article  
title: "Understanding Read-Only Transactions and Primary Key Choices in Databases"  
date: 2025-06-03  
modify_date: 2025-06-03  
excerpt: "Notes on why we use read-only transactions and how to choose between sequential keys and UUIDs in databases."  
tags: ["Database", "Transactions", "Primary Keys", "UUID", "Performance", "LectureNotes"]
mathjax: false  
mathjax_autoNumber: false  
key: "database-transactions-primary-keys"  
---

## Introduction

Have you ever wondered when to use read-only transactions in databases or whether to choose UUIDs or sequential IDs for primary keys? These questions can feel overwhelming when designing a database, especially when performance and scalability are at stake. In a Q&A session from January 2022, part of a database engineering course, the speaker tackles these topics head-on, offering practical insights that I found incredibly helpful.

The lecture focuses on two key areas: the purpose and benefits of read-only transactions and the trade-offs between using sequential IDs and UUIDs as primary keys. While no real-world stories were shared, the speaker used clear examples to explain how these concepts impact database performance and design. *The key revelation for me was that understanding how databases work internally empowers you to make informed decisions tailored to your specific needs.*

## Core Concepts

### Read-Only Transactions
A **read-only transaction** is a database operation that only retrieves data without making any changes. This approach has two main benefits:

- **Protection**: It prevents accidental modifications, ensuring data integrity, especially when running complex queries or calling methods that might unintentionally alter data.
- **Performance**: Databases like PostgreSQL can optimize operations by skipping tasks like generating transaction IDs or acquiring write locks, which are unnecessary for read-only tasks.

### Primary Keys: Sequential IDs vs. UUIDs
**Primary keys** uniquely identify records in a database table. The lecture compares two common types:

- **Sequential IDs**: These are typically integers (e.g., 1, 2, 3) that increment sequentially. They are compact and efficient for certain operations but can cause issues in high-concurrency scenarios.
- **UUIDs (Universally Unique Identifiers)**: These 128-bit values are unique across systems, making them ideal for distributed databases where records must be unique globally.

## Key Characteristics

### Read-Only Transactions

- Can be explicitly set to read-only to block any write attempts, adding a layer of safety.
- In databases like PostgreSQL, transactions are treated as read-only by default until a write operation is attempted, at which point they become read-write and require additional resources.

### Primary Keys

- **Sequential IDs**:
  - Small size (e.g., 4 bytes for an integer).
  - Efficient for indexing and range queries (e.g., selecting records with IDs between 1 and 10).
  - May lead to contention in high-insert scenarios due to sequential insertion patterns.
- **UUIDs**:
  - Larger size (16 bytes, or up to 36 bytes if stored as strings with dashes).
  - Universally unique, reducing conflict risks in distributed systems.
  - Randomness can cause fragmented indexes and random I/O operations, impacting performance.

## Advantages & Disadvantages

### Read-Only Transactions

- **Advantages**:
  - Ensures no accidental data changes, protecting data integrity.
  - Allows databases to skip resource-intensive operations, potentially improving performance.
- **Disadvantages**:
  - May be redundant if the database automatically detects read-only operations, as in PostgreSQL.

### Primary Keys

- **Sequential IDs**:
  - **Advantages**:
    - Smaller storage footprint, reducing memory and disk usage.
    - Optimized for sequential access and range queries, improving query performance.
  - **Disadvantages**:
    - Can cause contention in high-concurrency environments due to sequential insertion bottlenecks.
    - Less suitable for distributed systems where unique IDs across databases are needed.
- **UUIDs**:
  - **Advantages**:
    - Universally unique, perfect for distributed systems or client-generated IDs.
    - Reduces database load by allowing clients to generate IDs without querying the database.
  - **Disadvantages**:
    - Larger size increases storage and memory requirements, bloating indexes.
    - Randomness leads to fragmented indexes and random I/O, which can slow down queries and inserts.

| **Aspect**                | **Sequential IDs**                          | **UUIDs**                                   |
|---------------------------|---------------------------------------------|---------------------------------------------|
| **Size**                  | 4 bytes (integer)                          | 16 bytes (or 36 bytes as string)           |
| **Uniqueness**            | Unique within one database                 | Universally unique across systems          |
| **Performance**           | Faster for sequential access and ranges    | Slower due to random I/O and larger size   |
| **Use Case**              | Single database, high-performance queries   | Distributed systems, client-generated IDs  |
| **Contention**            | Higher in high-insert scenarios            | Lower, as IDs are generated independently  |

## Practical Implementations/Examples

### Setting a Read-Only Transaction

In PostgreSQL, you can explicitly set a transaction to read-only to ensure no data modifications occur. This is particularly useful when running reports or queries where data integrity is critical.

```sql
BEGIN TRANSACTION READ ONLY;
-- Your read queries here, e.g., SELECT * FROM users;
COMMIT;
```

### Creating Tables with Primary Keys

- **Sequential ID**:
  This example creates a table with a sequential integer primary key, ideal for single-database applications with frequent range queries.

```sql
CREATE TABLE example_seq (
    id SERIAL PRIMARY KEY,
    data TEXT
);
```

- **UUID**:
  This example uses a UUID primary key, suitable for distributed systems where uniqueness across databases is required.

```sql
CREATE TABLE example_uuid (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data TEXT
);
```

### Performance Considerations

The lecture highlighted how sequential IDs benefit from cache efficiency, as consecutive inserts and reads often access the same memory pages. For example, inserting IDs 1, 2, and 3 keeps data in a "hot" memory page, reducing disk I/O. In contrast, UUIDs' randomness means each insert or read may access different pages, increasing I/O operations and potentially slowing performance. This insight helped me understand why sequential IDs are often preferred for high-performance, single-database applications.

## Conclusion

This Q&A session clarified two critical database concepts. *Read-only transactions* offer a safety net against unintended changes and can boost performance by allowing databases to skip unnecessary operations. The choice between *sequential IDs* and *UUIDs* hinges on your application's needs: sequential IDs excel in performance and storage efficiency, while UUIDs shine in distributed systems requiring universal uniqueness.

Reflecting on this lecture, I’m struck by the speaker’s emphasis on understanding the "why" behind database decisions. *Knowing how transactions and primary keys impact performance and scalability empowers me to design better databases.* Whether I’m building a small app or a distributed system, these insights will guide my choices, ensuring I balance efficiency, safety, and scalability. I’m excited to experiment with these concepts in my projects and see how they perform in real-world scenarios.
