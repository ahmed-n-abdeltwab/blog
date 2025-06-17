---
layout: article
title: "Understanding Database Consistency in Transactions Day 2"
date: 2025-04-15
modify_date: 2025-04-15
excerpt: "This note summarizes a lecture on consistency in database systems, covering types of consistency, eventual consistency in distributed systems, and isolation levels that help maintain reliable data states."
tags:
  [
    "Database",
    "ACID",
    "Transactions",
    "Consistency",
    "Isolation",
    "LectureNotes",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: database-consistency-lecture-notes
---

## Understanding Database Consistency in Transactions

## Introduction

This lecture focused on **consistency in database systems**, which is one of the four ACID properties. It explained how consistency ensures that data stays accurate and reliable across operations, especially when multiple users or systems interact with the database. We also discussed types of consistency, how it behaves in distributed systems, and the role of isolation levels in preventing data problems.

---

## Core Concepts

### What is Consistency?

- Consistency means the data looks correct and follows defined rules.
- It ensures the database moves from one valid state to another.
- It's enforced by constraints, schema rules, and the way transactions are managed.

---

## Key Characteristics

### 1. Data Consistency

- Keeps related data in sync across different tables or collections.
- Relational databases support this using:
  - Foreign keys
  - Referential integrity
  - Cascade deletes
- Supported by:
  - **Atomicity** – all changes in a transaction are applied or none are.
  - **Isolation** – prevents other transactions from seeing incomplete changes.
- In NoSQL, atomicity usually works only within a single document or collection.

> Example: If a photo has 2 likes, there must be 2 corresponding records in the likes table.

---

### 2. Read Consistency

- Checks if one transaction can see the updates from another that just committed.
- Usually consistent in a single database server.
- Becomes challenging with:
  - Leader/follower setups
  - Read replicas
  - Caches

---

### 3. Eventual Consistency

- Used in distributed systems.
- Updates are not seen immediately everywhere, but all copies become consistent over time.
- Applies to:
  - Caching systems
  - Read replicas in relational databases
  - NoSQL systems like MongoDB or DynamoDB

**When is it okay?**

- OK: Social media likes or views.
- Not OK: Financial transactions like deposits or transfers.

> Important: Eventual consistency doesn't fix broken data—your database must still handle atomicity and isolation properly.

---

### 4. Read Phenomena (Issues in Concurrent Transactions)

#### Phantom Reads

- Happens when new rows are added by another transaction while one is running.
- Re-running the same query may return new results.
- Can lead to inconsistent reports.

#### Repeatable Read

- Guarantees the same values for already-read rows.
- May still allow phantom reads in some databases (not PostgreSQL).

#### Non-Repeatable Reads (Read Committed)

- A transaction sees updated values if another transaction changes a row after it’s been read.
- Results can change between two reads.

---

## Serializable Isolation Level

- The highest isolation level.
- Makes transactions behave as if they happened one at a time.
- Prevents all read phenomena: dirty reads, non-repeatable reads, phantom reads.
- Detects conflicts between concurrent transactions.
- May cancel and retry transactions to preserve consistency.

> Example: Two users try to apply the same discount code. Only one should succeed.

---

## Practical Implementations / Examples

- **Instagram-style example:** Likes must match the actual number of users who clicked "like" on a photo.
- **PostgreSQL:** Avoids phantom reads at `REPEATABLE READ` level.
- **MySQL / Oracle:** Require `SERIALIZABLE` or extra locking to avoid inconsistencies.

---

## Conclusion

Consistency is key to building reliable and predictable systems. Here's what to remember:

- **Data consistency** ensures rules between related data are followed.
- **Read consistency** checks if you see the latest updates.
- **Eventual consistency** is common in distributed systems but must be managed carefully.
- **Isolation levels** like `REPEATABLE READ` and `SERIALIZABLE` help protect data when multiple users interact at once.

Understanding how consistency works helps you write safer transactions and build better database applications.
