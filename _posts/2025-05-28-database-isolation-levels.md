---
layout: article
title: "Clarifying Database Isolation Levels"
date: 2025-05-28
modify_date: 2025-05-28
excerpt: "An overview of transaction isolation levels, their behaviors, and practical strategies to manage concurrency in real-world database systems."
tags: ["Isolation Levels", "Database", "Transactions", "ACID", "LectureNotes", "QA"]
mathjax: false
mathjax_autoNumber: false
key: database-isolation-levels
---

## Introduction

- **Pain point:** Ever generated a report and seen values change mid-transaction? It feels like chasing a moving target.
- **Lecture overview:** This talk dives into the motivations and implementations behind **Read Committed**, **Repeatable Read**, **Snapshot Isolation**, and **Serializable** levels.  
- **Failure story:** In one system, two doctors each saw the other as “available” and both signed off—leaving no one on shift.  
- **Key revelation:** Viewing isolation as *versioned snapshots* simplifies understanding and avoids unnecessary complexity.

> “For the rows that I read in my transaction, make sure that they are repeatable.” :contentReference[oaicite:0]{index=0}

---

## Core Concepts / Overview

1. **Read Committed**  
   - Reads the latest committed data at the start of each query.  
   - Allows **non-repeatable reads**: same query can return different results if data is committed in between.  
2. **Repeatable Read**  
   - Ensures rows you’ve read won’t change during your transaction.  
   - Doesn’t prevent **phantom reads** (new rows matching your query can appear).  
3. **Snapshot Isolation**  
   - Treats each transaction as if reading a frozen view of the database at its start.  
   - Labels each row with a version timestamp; only rows ≤ transaction start are visible.  
4. **Serializable**  
   - The strictest level: transactions behave as if run one after another.  
   - Detects conflicts and forces retries on serialization failures.

---

## Key Characteristics

- **Read Committed**  
  - *Query-level snapshot*: each statement sees a fresh snapshot.  
  - *Simple* and common default.  
- **Repeatable Read**  
  - *Row-level locks* or versions ensure stability of read data.  
  - *Phantom rows* are still possible.  
- **Snapshot Isolation**  
  - *Versioned rows* eliminate both non-repeatable reads and phantoms by fixing the read time at transaction start.  
  - Widely used in Postgres and some other systems.  
- **Serializable**  
  - *Optimistic concurrency control*: detects dangerous patterns (like the two-doctor shift problem) and aborts conflicting transactions.

---

## Advantages & Disadvantages

| Level               | Advantages                                    | Disadvantages                                            |
|---------------------|-----------------------------------------------|----------------------------------------------------------|
| Read Committed      | Fast, low overhead                            | Non-repeatable reads                                      |
| Repeatable Read     | Stable reads for same rows                   | Phantom reads                                            |
| Snapshot Isolation  | Simple implementation of repeatable + no phantoms | Not truly serializable; can still violate application rules |
| Serializable        | Full correctness                             | Higher abort/retry rates; possible performance impact    |

---

## Practical Implementations / Examples

1. **Versioned Rows (Snapshot)**  
   ```sql
   -- Each row carries a created_txn and deleted_txn timestamp
   SELECT * 
     FROM accounts
    WHERE created_txn <= my_txn_id
      AND (deleted_txn IS NULL OR deleted_txn > my_txn_id);
   ```

2. **Pessimistic Locking**

   ```sql
   BEGIN TRANSACTION;
   SELECT * 
     FROM doctor 
    WHERE id = 7
      FOR UPDATE;
   -- Locks row until COMMIT to prevent concurrent updates
   COMMIT;
   ```
3. **Optimistic Control (Serializable)**

   * Let transactions run.
   * On commit, database checks for conflicts and aborts if needed, prompting a retry.

---

## Conclusion

* **Isolation trade-offs** come down to performance vs correctness.
* *Snapshot isolation* offers a practical middle ground: stable reads without complex locking.
* For critical scenarios (e.g., ensuring at least one doctor on shift), use **Serializable** or explicit **SELECT FOR UPDATE**.
* Reflect on your application’s needs and choose the level that balances safety, simplicity, and speed.
* *Keeping it practical* helps avoid theoretical pitfalls and build reliable systems.
