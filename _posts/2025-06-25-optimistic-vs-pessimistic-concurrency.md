---
layout: article
title: "Optimistic vs Pessimistic Concurrency Control in Databases"
date: 2025-06-25
modify_date: 2025-06-25
excerpt: "A personal look into how databases manage concurrent access through two main strategies: optimistic and pessimistic concurrency control."
tags:
  [
    "Database",
    "Concurrency",
    "LectureNotes",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: optimistic-vs-pessimistic-concurrency
---

## Optimistic vs Pessimistic Concurrency Control in Databases

### Introduction

Have you ever wondered what happens if two people try to update the same database record at the same time? If the system is not careful, one person’s change could overwrite the other’s and effectively disappear – this is known as a _lost update_. Concurrency control is how a database handles these situations. In simple terms, it **manages multiple transactions** so they don’t clash. Without it, saving your changes could be dangerous: you might save a value, and then someone else saves a different value on top of it, leaving the first update “lost”. The goal is to make sure that when one transaction writes data, others see a consistent state and don’t accidentally overwrite it.

> "How would you prevent someone else from changing that value you just changed?"

This question from the lecture highlights the problem. In a database with many users or transactions, concurrency control is critical. Nearly all modern databases (PostgreSQL, MySQL, MongoDB, etc.) support multiple concurrent transactions, so they need a strategy to avoid conflicts. In the next sections, we’ll explore two main strategies for this: **pessimistic** and **optimistic** concurrency control.

### Core Concepts

_Concurrency control_ refers to techniques that ensure database changes happen in a safe, consistent way when multiple transactions run at the same time. Transactions are sequences of operations that should appear atomic (all or nothing). Without control, they can interfere: for example, one person’s transaction might overwrite another’s updates or read incomplete results. Concurrency control prevents this by coordinating reads and writes.

One classic problem is the _lost update_: if two transactions both read and then write the same data, one write might be lost. The lecture notes explain that if you allow two updates without coordination, you can get a lost update where “you made a change, but you turn it on and it's lost”. Concurrency control prevents that by controlling when and how data is locked or checked during transactions.

Overall, concurrency control **ensures data integrity** when multiple transactions run. It does so by defining how and when transactions see each other’s updates, either by using locks (pessimistic approach) or by checking at the end (optimistic approach).

### Key Characteristics

- **Pessimistic Concurrency Control:** This approach _locks_ data when you start a transaction. As the lecture explains, under pessimistic control “you say, _I'm going to lock this thing and prevent anyone from changing it_”. For example, if you update a row, the database puts a lock on that row (or even the whole table) so other transactions cannot change it until you’re done. One analogy is that you always carry an umbrella because you _think it’s going to rain_: the system always protects against conflict just in case. This means no one will overwrite your data mid-transaction, so you avoid lost updates. However, locks come at a cost: they must be managed in memory or on disk, and they can block other transactions. The lecture emphasizes that _“locks are expensive”_ and require work to manage. In short, pessimistic control is safe but can slow things down if many transactions wait on locks.

- **Optimistic Concurrency Control:** This strategy avoids taking locks up front. Instead, transactions proceed as if no one else is editing the data. Only at the **commit point** does the database check for conflicts. As the lecture puts it, with optimistic control you say _“you can update this row and we're not going to lock it, because chances that some other transaction will update it are really low”_. Then when you try to commit, the system does a quick check – if the data you read has been changed by someone else, your transaction fails (and you must retry). This is like deciding not to carry an umbrella: you might get a bit wet, but you only check if you really need it at the end. The lecturer even jokes about this: _“Don't take that umbrella... you're going to get a little bit wet. Who cares? So that's optimistic concurrency control”_. Optimistic control adds overhead in handling rollbacks and retries, but it can greatly reduce waiting because transactions don’t lock each other upfront.

### Advantages & Disadvantages

- **Pessimistic Concurrency Control:**

  - _Pros:_ It ensures that if many transactions try to update the same data, they are safely serialized. No transaction will accidentally overwrite another’s data. In environments with high conflict (many concurrent updates), pessimistic control can actually be more efficient because it avoids repeated rollbacks.
  - _Cons:_ Managing locks has overhead. Locks use memory/CPU and can block other transactions, which hurts throughput. As the lecture warns, _“locks are expensive”_ and can cause other transactions to wait or even deadlock. For example, SQL Server may escalate thousands of row locks to a single table lock to save memory, but this can block many transactions at once. In short, pessimistic locking keeps transactions safe, but it can slow down a busy system.

- **Optimistic Concurrency Control:**

  - _Pros:_ It avoids most locking overhead. If conflicts are rare, transactions do not have to wait at all. The lecture and other sources note that in low-conflict environments, optimistic control yields higher throughput because transactions proceed without pausing for locks. You only pay a small cost at commit time to check for conflicts. This is ideal for systems where transactions usually work on different data.
  - _Cons:_ The main risk is conflict during commit. If two transactions do collide (both update the same data), one will fail and need a retry. This puts extra burden on the application to handle those rollbacks. In high-conflict situations, optimistic control can perform poorly because many transactions might keep failing and retrying. It also means a transaction could complete all its work only to be told at the end that it must undo everything.

> _“Optimistic concurrency is more efficient when update collisions are expected to be infrequent; pessimistic concurrency is more efficient when collisions are expected to occur often.”_

### Practical Implementations

- **PostgreSQL:** PostgreSQL generally uses a lock-based (pessimistic) approach for updates. Internally, it has row-level locks, but the lock information is actually kept on disk (using “hint bits”) rather than in memory. In other words, PostgreSQL still locks rows to protect them, but writes the lock status to disk as it writes the row. This saves memory, though it means extra I/O. The key point is that PostgreSQL’s implementation is pessimistic – it enforces locks so that concurrent updates don’t overlap.

- **SQL Server:** SQL Server also uses locks for concurrency control, keeping lock state in memory. It has a feature called _lock escalation_. If a transaction locks many rows (for example 7,000 rows), SQL Server might replace those thousands of locks with one table-level lock. This saves memory (fewer lock entries) but has a big drawback: one table lock can block almost all other transactions on that table. So SQL Server’s default is pessimistic (lock everything it touches), but it tries to balance memory use by escalating locks when needed.

- **MongoDB:** MongoDB’s WiredTiger storage engine takes the optimistic path. WiredTiger is a modern log-structured engine designed for multi-core CPUs, and it implements optimistic concurrency control. As one source puts it, MongoDB doesn’t want the “headache of managing locks,” so it adopts optimistic locking instead. This means MongoDB will allow concurrent updates without locking them, and rely on version checks (and sometimes retries) at commit time. In practice, MongoDB’s approach avoids many traditional lock waits but requires clients to handle occasional write conflicts.

### Conclusion

Both optimistic and pessimistic concurrency control have their place, and it’s important to understand both models. In simple terms, **pessimistic control** is like always carrying an umbrella – you lock data up front to avoid conflicts, at the cost of more waiting and resource use. **Optimistic control** is like taking a chance in the rain – you assume conflicts are rare and only check at the end, at the cost of possible retries. There is no one-size-fits-all answer. As the lecturer admits, _“I don't have a favorite. I just think every use case really depends on which path to take”_.

In practice, you might prefer a pessimistic approach for mission-critical updates where you absolutely can’t afford a failed transaction, or when you know many transactions will touch the same data. On the other hand, for high-throughput systems with mostly independent updates, optimistic control can improve performance by reducing lock waits. Understanding how your database implements concurrency (locks on disk vs memory, or optimistic checks) can help you design your application and choose the right strategy.

Overall, concurrency control is a fundamental part of databases, and knowing how it works – and when to use each model – is key to building reliable, efficient applications.
