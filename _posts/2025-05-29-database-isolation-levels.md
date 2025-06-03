---
layout: article
title: "Understanding Repeatable Read vs. Snapshot Isolation in Database Transactions"
date: 2025-05-29
modify_date: 2025-05-29
excerpt: "A clear explanation of how Repeatable Read and Snapshot Isolation work in databases, focusing on handling data changes during transactions."
tags:
  [
    "ACID",
    "Transactions",
    "Database",
    "IsolationLevels",
    "LectureNotes",
    "Q&A",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: true
mathjax_autoNumber: true
key: database-isolation-levels
---

## Introduction

Picture this: you’re building an app, and suddenly, the data you’re working with changes right under your nose. One minute, you see one result; the next, it’s different—even though you didn’t touch it! This confusion is why I found today’s lecture so helpful. It’s all about **database isolation levels**, specifically **Repeatable Read** and **Snapshot Isolation**, and how they manage data when multiple transactions happen at once.

The lecture aimed to explain the difference between these two levels using a simple example. The big reveal? **Snapshot Isolation** keeps your view of the data steady, while **Repeatable Read** might let surprises sneak in. No real-world failure stories were shared, but the concepts clicked for me with the examples given.

---

# Core Concepts/Overview

**Isolation levels** are rules in databases that control how transactions see and change data when they run together. They’re part of the **ACID** system (Atomicity, Consistency, Isolation, Durability) to keep things reliable. Today, we dug into two levels:

- **Repeatable Read:**

  - When a transaction reads a row, it promises that reading the same row again will show the same data.
  - But it doesn’t stop **phantom reads**—new rows added by other transactions that can pop up and change your results.

- **Snapshot Isolation:**
  - Gives you a “snapshot” of the database from when your transaction started.
  - Uses **versioning** to show only data that was saved before your transaction began, ignoring later changes.
  - This stops phantom reads completely.

The lecturer used an example: a query to find the pet with the highest score in a table called `pet_shots`. If another transaction updates scores while yours is running, the isolation level decides what you see.

---

# Key Characteristics

Here’s what stands out about each level:

- **Repeatable Read:**

  - Protects rows you’ve already read from changes.
  - But if new rows are added (phantom reads), your query might pick them up, changing the result.

- **Snapshot Isolation:**
  - Locks in a consistent view of the database from the start.
  - Filters out any changes made after your transaction begins, based on a timestamp or version.

---

# Practical Implementations/Examples

The lecturer shared a SQL query example and some database details:

- **The Query:**

  - Original:

    ```sql
    SELECT pet_id, pet_name, score FROM pet_shots WHERE score = (SELECT MAX(score) FROM pet_shots);
    ```

  - Suggested rewrite (faster):

    ```sql
    SELECT pet_id, pet_name, score FROM pet_shots ORDER BY score DESC LIMIT 1;
    ```

  - _Why faster?_ It uses one query with an index, instead of two separate steps.

- **The Scenario:**

  - Transaction 1 runs the query to find the top pet.
  - Transaction 2 updates a score and commits.
  - Run the query again in Transaction 1:
    - **Repeatable Read:** You might see a new top pet because of added rows (phantom reads).
    - **Snapshot Isolation:** You’ll see the same top pet as before, thanks to versioning.

- **Database Differences:**
  - **PostgreSQL:** Treats Repeatable Read like Snapshot Isolation because it uses versioning by default.
  - **MySQL:** Might act differently—needs testing in a Docker container to check.

---

# Conclusion

This lecture cleared up how **Repeatable Read** and **Snapshot Isolation** handle data changes in transactions. **Repeatable Read** keeps rows you’ve read consistent but lets new rows sneak in. **Snapshot Isolation** gives you a steady view of the database, no surprises.

_My takeaway?_ If I need rock-solid consistency, Snapshot Isolation is the way to go. It’s cool how databases like PostgreSQL tweak these rules for better performance. I’ll definitely test this in MySQL someday to see how it behaves!

---

_These are my personal notes from the lecture—super useful for revisiting later!_
