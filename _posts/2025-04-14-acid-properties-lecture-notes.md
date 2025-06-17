---
layout: article
title: "Understanding ACID Properties in Databases"
date: 2025-04-14
modify_date: 2025-04-14
excerpt: "This note summarizes the key concepts of ACID properties (Atomicity, Consistency, Isolation, Durability) in database transactions and the definition of a transaction itself."
tags:
  [
    "Databases",
    "ACID",
    "Transactions",
    "Atomicity",
    "Consistency",
    "Isolation",
    "Durability",
    "LectureNotes",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: acid-properties-lecture-notes
---

## Overview of Database Transactions and ACID Properties

## Introduction

This lecture series aims to provide a comprehensive understanding of **database transactions** and the fundamental **ACID** properties: **Atomicity, Consistency, Isolation, and Durability**. These properties are critical for building and using relational database systems effectively (e.g., **Postgres, MySQL, SQL Server, Oracle**), as well as being relevant to NoSQL and graph databases.

The lectures will cover:

- The definition of a transaction
- Detailed explanation of each ACID property
- Practical examples to illustrate these concepts

---

## Core Concepts

### What is a Transaction?

A **transaction** is a **collection of SQL queries treated as a single unit of work**. Many logical operations span multiple queries across different tables, and treating them as a transaction ensures correctness.

- Begins with: `BEGIN`
- Ends with:
  - `COMMIT` → to save changes
  - `ROLLBACK` → to discard changes
- On system failure: uncommitted changes are rolled back automatically
- Even read-only operations can use transactions to get consistent snapshots
- Single SQL statements outside explicit transactions are **implicitly** wrapped in a transaction by the database

---

## ACID Properties

### 1. Atomicity

**All operations succeed or none do.**

- One indivisible unit: success or full rollback
- If any query fails (e.g., due to constraint violations), all previous changes in the transaction are undone
- On crash before commit: database rolls back incomplete changes
- Techniques:
  - **Undo logs**
  - Deferring disk writes until commit
- Long transactions with many writes may result in slow rollback

---

### 2. Consistency

**Brings the database from one valid state to another.**

#### Two types of consistency

- **Data Consistency:**
  - Ensures rules like foreign keys and constraints are upheld
  - Prevents logically incorrect data (e.g., a like for a non-existent picture)
- **Read Consistency (Distributed Systems):**
  - Ensures once a transaction commits, others can immediately see changes
  - **Replication lag** may cause temporary inconsistency
  - **Eventual consistency**: data becomes consistent over time but may be stale in the short term

> Consistency is largely enforced by database schemas and user-defined constraints.

---

### 3. Isolation

**Ensures concurrent transactions do not interfere with each other.**

#### Read Phenomena

| Phenomenon               | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| **Dirty Reads**          | Reading uncommitted changes from another transaction     |
| **Non-Repeatable Reads** | Reading the same row twice returns different values      |
| **Phantom Reads**        | Range query returns different rows on repeated execution |
| **Lost Updates**         | One transaction overwrites another’s changes             |

#### Isolation Levels

| Level                | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| **Read Uncommitted** | Lowest isolation, allows dirty reads                                |
| **Read Committed**   | Prevents dirty reads (common default)                               |
| **Repeatable Read**  | Prevents non-repeatable reads (Phantoms still possible in some DBs) |
| **Snapshot**         | Each query sees a snapshot from the start of the transaction        |
| **Serializable**     | Highest isolation, fully prevents all read phenomena                |

- **Concurrency control mechanisms**:
  - **Pessimistic** (locks)
  - **Optimistic** (check conflicts at commit time)

---

### 4. Durability

**Once committed, changes are permanent, even after crashes.**

- Uses **non-volatile storage** like SSD or hard disks
- Ensures recoverability using:
  - **Write-Ahead Logging (WAL)**: logs written before data files
  - **Snapshots** and **append-only files**
- **OS cache** may delay physical writes → use `fsync` to force flush
- Some systems (e.g., **Redis**) offer config options to trade durability for speed

---

## Practical Examples Using PostgreSQL

### Atomicity & Consistency

#### **Tables:**

```sql
products(pid SERIAL PRIMARY KEY, name TEXT, price FLOAT, inventory INTEGER)
sales(sale_id SERIAL PRIMARY KEY, pid INTEGER, price FLOAT, quantity INTEGER)
```

#### **Scenario: Selling 10 phones**

```sql
BEGIN;
UPDATE products SET inventory = inventory - 10 WHERE pid = 1;
INSERT INTO sales (pid, price, quantity) VALUES (1, 999.99, 10);
COMMIT;
```

- If a crash occurs after `UPDATE` but before `INSERT`/`COMMIT`, inventory remains unchanged
- Demonstrates atomic rollback on failure
- When successful, both inventory and sales record are updated, ensuring consistency

---

### Isolation

#### **Scenario: Report generation vs concurrent sales**

- With **READ COMMITTED**, report might see inconsistent data
- With **REPEATABLE READ**:

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- run reporting queries
COMMIT;
```

- The report sees a consistent snapshot, unaffected by concurrent transactions

---

### Durability

#### **Scenario: Insert a product and crash**

```sql
BEGIN;
INSERT INTO products (name, price, inventory) VALUES ('TV', 3000, 10);
COMMIT;
docker stop pg_acid
```

- After restarting the container, querying `products` still shows the TV
- Demonstrates durability: committed changes survive system crash

---

## Conclusion

Understanding **transactions** and **ACID** properties is fundamental for building **reliable** and **consistent** database applications:

- **Atomicity** → Prevents partial updates
- **Consistency** → Ensures data integrity
- **Isolation** → Controls concurrent access
- **Durability** → Guarantees data persistence

Together, these properties ensure **data accuracy**, **fault tolerance**, and **safe concurrency** in any serious database system.
