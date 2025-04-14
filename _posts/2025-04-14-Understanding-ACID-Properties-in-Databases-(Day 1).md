---
layout: article
title: "Understanding ACID Properties in Databases"
date: 2024-07-30
modify_date: 2024-07-30
excerpt: "This note summarizes the key concepts of ACID properties (Atomicity, Consistency, Isolation, Durability) in database transactions and the definition of a transaction itself."
tags: ["Databases", "ACID", "Transactions", "Atomicity", "Consistency", "Isolation", "Durability", "LectureNotes"]
mathjax: false
mathjax_autoNumber: false
key: "acid-properties-lecture-notes"
---

# **Database Transactions and ACID Properties**

## **1. What is a Transaction?**

*   A **collection of SQL queries** treated as **one unit of work**.
*   Necessary because data in SQL is structured across multiple tables, often requiring several queries to achieve a logical application-level task.
*   **Example:** An account deposit involving selecting from one account, updating to deduct, and updating another to credit.
*   **Transaction Lifespan:**
    *   Begins with the **`BEGIN`** keyword.
    *   Changes are not persistent until **`COMMIT`** is issued.
    *   **`COMMIT`** persists changes to disk. The database handles the details of this persistence. There are different strategies (e.g., writing frequently vs. writing at commit), each with trade-offs in speed.
    *   **`ROLLBACK`** discards all changes made since the `BEGIN`. Rollback can be faster if changes are primarily in memory.
    *   Databases can implicitly start and immediately commit transactions for single queries.
    *   Transactions can be **read-only** to obtain a consistent snapshot of the data at the transaction's start time. This helps maintain consistency for reports by isolating the read operations from concurrent changes.
    *   Transactions provide a **snapshot of the data** at their start.
    *   **Unexpected transaction endings (e.g., crashes)** should result in a **rollback** upon database restart. The database must be designed to detect and handle these scenarios.
*   Transactions are primarily used to **change and modify data**, but read-only transactions are also important.

## **2. ACID Properties**

*   **ACID** stands for **Atomicity, Consistency, Isolation, and Durability**. These are critical properties for relational database systems and important concepts for any database system.

    ### **2.1. Atomicity**

    *   **All queries within a transaction must either succeed completely, or all the effects of prior successful queries must be rolled back**. It's an indivisible unit of work.
    *   If **one query fails** (due to constraint violation, duplicate key, invalid syntax), the entire transaction rolls back immediately.
    *   If the **database crashes before a `COMMIT`**, all changes made by the in-progress transaction should be rolled back upon restart. The database needs to detect these failures and perform the rollback.
    *   Lack of atomicity leads to **inconsistent data**. **Example:** If a money transfer fails halfway, one account might be debited without the other being credited, resulting in lost funds.
    *   Rolling back long transactions can take a significant amount of time as the database needs to undo all the changes. Some databases might not even start until a rollback is complete.
    *   **Example (Account Transfer):** To transfer $100 from account 1 ($1000 balance) to account 2 ($500 balance), a transaction would involve selecting the balance, updating account 1 to subtract $100, and updating account 2 to add $100. If a crash happens after the first update but before the second, atomicity ensures account 1's balance would be rolled back to $1000.

    ### **2.2. Isolation**

    *   Controls how **concurrent transactions interact with each other**. It determines if one transaction can see changes made by other transactions that are still in progress or have already finished.
    *   **Read Phenomena (generally undesirable side effects of concurrency)**:
        *   **Dirty Reads:** A transaction reads data that has been written by another transaction but not yet committed. This data might be rolled back, leading to inconsistencies. **Example:** Transaction 1 updates a product quantity but hasn't committed. Transaction 2 reads this uncommitted quantity. If Transaction 1 rolls back, Transaction 2 has read incorrect data.
        *   **Non-Repeatable Reads:** Within the same transaction, reading the same data multiple times yields different results because another transaction has committed a change in between the reads. This can lead to inconsistent aggregations or reporting. **Example:** Transaction 1 reads the total sales. Transaction 2 then makes and commits a new sale. If Transaction 1 reads the total sales again, the value will be different.
        *   **Phantom Reads:** A transaction executes a range query and gets a set of rows. Another transaction then inserts or deletes rows that fall within the same range and commits. If the first transaction re-executes the same range query, it will see a different number of rows ("phantoms"). This involves new or deleted rows, not just changes to existing ones. **Example:** Transaction 1 selects all sales for a specific date. Transaction 2 inserts a new sale for that date and commits. If Transaction 1 re-selects, the new sale will appear.
        *   **Lost Updates:** Two concurrent transactions read the same data, and both attempt to update it based on the initial read. The update of the first transaction can be overwritten by the second transaction's commit, effectively losing the first update. **Example:** Two transactions increment the quantity of a product. Both read the initial quantity. One increments and commits. The other then increments based on the original value and commits, overwriting the first increment.
    *   **Isolation Levels (SQL standards to control read phenomena)**:
        *   **Read Uncommitted:** Lowest level, no isolation. Transactions can read uncommitted changes from other transactions (dirty reads are possible). Generally not fully supported in many databases.
        *   **Read Committed:** Each query within a transaction only sees changes that have been committed by other transactions. Prevents dirty reads, but non-repeatable reads, phantom reads, and lost updates can still occur. Often the default isolation level for many databases.
        *   **Repeatable Read:** Ensures that if a transaction reads a row, subsequent reads of the same row within the same transaction will return the same value. Prevents dirty reads and non-repeatable reads, but phantom reads can still occur in some database implementations. **Postgres implements Repeatable Read as Snapshot Isolation**.
        *   **Snapshot:** Each query within a transaction sees a snapshot of the database as it existed at the moment the transaction began. This eliminates dirty reads, non-repeatable reads, and phantom reads.
        *   **Serializable:** Highest level of isolation. Transactions are executed in a way that appears as if they were run one after another (serialized). This prevents all read phenomena, but it can reduce concurrency. Often implemented using optimistic concurrency control.
    *   **Database Implementation of Isolation**:
        *   **Pessimistic Concurrency Control (Locking):** Uses locks (row-level, table-level, page-level) to prevent concurrent modifications of data. `SELECT FOR UPDATE` can be used for row-level locking. Locks can sometimes escalate from rows to tables, impacting concurrency. Lock management can be expensive.
        *   **Optimistic Concurrency Control:** Detects conflicts at the time of commit. If a conflict is detected (data has changed since the transaction started), the transaction might be rolled back, and the user may need to retry. NoSQL databases often prefer this approach. Repeatable read locks the rows it reads.

    ### **2.3. Consistency**

    *   Refers to maintaining the **integrity and validity of the database data**. It ensures that the database transitions from one valid state to another valid state.
    *   **Two main aspects of consistency**:
        *   **Consistency in Data:** The persisted data adheres to the database schema rules and constraints defined by the user/DBA. This includes **referential integrity** (foreign key constraints). **Atomicity and Isolation** mechanisms are crucial for ensuring consistency in data. Inconsistent data examples include a mismatch in likes count or orphaned picture likes.
        *   **Consistency in Reads:** After a transaction commits, subsequent read operations should immediately reflect the committed changes. This is important in systems with multiple instances or replicas. Replication lag in master-slave setups can lead to temporary read inconsistencies.
            *   **Eventual Consistency:** Changes might have a delay before being reflected across all parts of a distributed system. This is often a trade-off for higher availability and scalability. Eventual consistency addresses read inconsistencies but doesn't fix corrupt data.
            *   **Stronger Read Consistency** can be achieved through **synchronous replication**, which is typically slower than **asynchronous replication** but ensures that a commit is reflected on replicas before acknowledging success to the client.
    *   Consistency rules are generally **defined by the user or the DBA** through schema definitions and constraints.

    ### **2.4. Durability**

    *   Once a transaction is **committed**, the changes made to the database must be **permanently saved to non-volatile storage** (e.g., SSD, hard drive).
    *   The data should be recoverable even after system failures such as power loss or crashes that occur after the commit.
    *   **Durability Techniques**:
        *   **Write-Ahead Log (WAL):** Logs all changes to a separate file before the actual data files are updated. These logs are flushed to disk immediately to ensure persistence. In case of a crash, the database can replay the WAL to recover committed transactions. WAL segments are often compressed for efficiency.
        *   **Asynchronous Snapshots:** Periodic full copies of the database are saved to disk in the background.
        *   **Append-Only File (AOF):** Similar to WAL, it records all write operations performed on the database.
    *   **Operating System (OS) Cache:** Write operations often initially go to the OS cache for performance reasons. The OS might acknowledge the write as successful before the data is actually written to disk.
    *   The **`fsync` command** forces the OS to bypass its cache and write data directly to disk, providing stronger durability but potentially slowing down commits. Databases use `fsync` strategically to ensure durability after a commit.
    *   Some databases offer trade-offs between immediate durability and faster write performance. Acknowledging a commit to the user implies that the changes are durable.

## **3. Practice Examples (Postgres)**

*   Demonstrated **Atomicity and Consistency** by performing a product sale (updating inventory and inserting a sales record) within a transaction. Simulating a crash before commit showed that the inventory change was rolled back. Committing both operations ensured consistency.
*   Demonstrated **Isolation** issues with the default **Read Committed** level, where a report generation transaction could see a new sale committed by another concurrent transaction, leading to inconsistent counts.
*   Switching the isolation level to **Repeatable Read** provided a consistent snapshot, preventing the report transaction from seeing the newly committed sale until its own transaction was completed.
*   Demonstrated **Durability** by inserting a new product within a transaction and immediately committing, followed by simulating a server crash. Upon restart, the committed product was still present in the database, confirming durability. The `COMMIT` return indicates the data has been persisted.

