---
layout: article
title: "Advanced InnoDB Locking Techniques in MySQL 8"
date: 2025-06-25
modify_date: 2025-06-25
excerpt: "This lecture covers how MySQL 8 improved locking in InnoDB with smarter page-level concurrency and B+ tree optimizations."
tags:
  [
    "MySQL",
    "InnoDB",
    "Database",
    "LectureNotes",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: true
mathjax_autoNumber: true
key: mysql-innodb-locking
---

## Introduction

We all dread waiting on a **slow query**. In databases, locking can be a hidden culprit for performance issues. MySQL’s InnoDB engine has a reputation for strong concurrency, but even it needs careful design. In MySQL 5.6, InnoDB used a simple scheme: it took one _shared lock_ on the entire index (plus locks on the leaf page being read) during a search. This was easy to implement but had a downside: a **Schema Modification Operation (SMO)** like a page-split or index build would lock the whole index and _block readers_. In practice, people saw that MySQL 5.6 was “simpler and faster” for many queries, until heavy concurrent writes kicked in and everything slowed down.

MySQL 8 overhauled this. The new insight is that **fine-grained locking** on B+ tree pages lets multiple threads work in parallel. MySQL 8 adds _page-level locks_ on internal (non-leaf) nodes and a special _SX (schema-modification intent) lock_. The result is that readers usually only block each other on the exact pages they share, instead of the whole index. The trade-off, of course, is that the locking protocol is now more complex. _The payoff_ is much higher concurrency (and better use of modern multi-core CPUs) at the cost of harder-to-reason-about code and potential corner cases.

## Core Concepts / Overview

InnoDB uses **B+ trees** for every secondary and primary index. A B+ tree has multiple layers: a single **root** page at the top, one or more **internal (non-leaf)** layers in the middle, and **leaf** pages at the bottom. The leaf pages actually store the data records (or pointers to them) in sorted order. The internal pages only store index keys and pointers to child pages. Each node (page) can hold many keys, so a tree with fan-out \$b\$ and \$N\$ records has height roughly \$h \approx O(\log_b N)\$, meaning searches are \$O(\log N)\$. Between layers the tree has **downward pointers** from a page to its child pages; within each level, sibling pages are doubly linked to allow in-order traversal.

Locking in InnoDB works at two levels:

- **Index lock**: a mutex on the _entire_ B+ tree index (field `dict_index->lock` in code). In older versions, this was used to serialize structure changes.
- **Page lock**: a mutex on an individual page (node) of the B+ tree. In MySQL 8, both leaf and non-leaf pages get their own locks, whereas before only leaves did.

By "locking a B-tree" we usually mean applying both index and page locks. For example, a read used to just take an S-lock on the index and then on the leaf page. In MySQL 8 it now also takes S-locks on each internal page visited.

**Leaf vs Non-leaf nodes:** A leaf node holds the actual rows (or pointers to them). A non-leaf (internal) node holds only keys and pointers downward, helping guide searches. Every non-leaf node points to several children; in a B+ tree, the leaves are linked in a list for range scans.

**Index vs Page locks:** The _index lock_ is like a global lock on the tree structure (used mainly during big changes). The _page locks_ are finer: each leaf or internal page has its own lock bit. MySQL 5.6 mostly ignored internal pages (no locks on them), whereas 8.0 explicitly locks internal pages.

## Key Characteristics

- **Shared (S) vs Exclusive (X) locks:** A shared lock is a _read lock_. You take an S-lock on a page or index to read without worrying that someone else might write it at the same time. Multiple threads can hold S-locks on the same object concurrently (they don’t conflict). An exclusive (X) lock is for writing; it conflicts with any other S or X on that object. In other words, X-locking a page blocks all other readers and writers of that page.

- **SX lock (Schema intent):** MySQL 8 introduces a new lock mode called _SX_ (sometimes written Sx or schema-modification lock). This is essentially an _intent_ lock on the index: a thread signals that it _intends_ to modify structure (e.g. split a page) but isn’t doing it _yet_. An SX lock does not conflict with normal S-locks, so reads can continue, but it _does_ conflict with other SX or X locks. In practice, this means only one thread can be preparing a structure change at once, but readers don’t have to stop. (Before SX existed, InnoDB would just take an X-lock on the whole index for a split, which blocked all readers.)

- **Page splits and SMOs:** When an INSERT finds a leaf page is full, InnoDB performs a _pessimistic insert_ (SMO). In MySQL 5.6, it would then lock the entire index with X, preventing any other access. In MySQL 8.0, the process is more nuanced. First, the thread gets an SX lock on the index (allowing others to hold S locks). It also has S locks on all pages in the search path. Only when it actually splits pages does it temporarily upgrade to X-locks on the affected pages. Thus, non-modified pages stay just S-locked.

- **Latch coupling (lock coupling):** When traversing the B+ tree from root to leaf, InnoDB uses _latch coupling_: it locks a child node before releasing its parent’s lock. Concretely, it holds an S-lock on the root and first-level pages until the next-level lock is acquired. Then it drops the parent locks, keeping the child. This sliding-window approach keeps lock durations short and only along the path, minimizing overlap.

## Advantages & Disadvantages

- **Pros:**

  - **Higher concurrency:** Readers and writers block each other less. InnoDB 8.0 can allow other sessions to _read_ even while a split is being prepared, because it only holds SX (not X) on the index. This means heavy read workloads are less impacted by occasional writes.
  - **Fine-grained locking:** Different threads can lock different pages independently. For example, two reads on different parts of the tree do not contend at all (only their leaf pages are locked). This tends to improve throughput on multi-core systems.
  - **Optimistic updates:** Simple INSERTs that don’t split a page behave almost like before (just S-lock path, then X-lock leaf). Only when a split happens do we incur extra overhead.

- **Cons:**

  - **Increased complexity:** There are now more lock modes (S, X, SX) and more lock points (internal pages as well as leaf). The implementation is harder to understand and maintain. This complexity can make bugs or subtle deadlocks more likely.
  - **Single SMO at a time:** Because an SX lock conflicts with other SX, only one page-split or index change can proceed concurrently. In other words, massive concurrent inserts that each cause splits will effectively serialize on the index.
  - **Lock overhead:** Every search now locks multiple pages. For very short, simple queries the overhead of acquiring/releasing more locks might be a slight cost compared to the old method.
  - **Potential starvation scenarios:** In theory, a long-running SX lock (rare though it is) could delay other writers. Conversely, some threads might hold S-locks on many pages, briefly delaying a structure change. In practice this hasn’t been a big issue, but it’s a trade-off.

## Practical Implementations / Examples

Consider a simple example B+ tree (values 1..7) as shown below. It has multiple levels of nodes with keys and pointers:

&#x20;_Figure: A simple example B+ tree. Internal (non-leaf) nodes contain only keys, and leaf nodes (at bottom) contain the actual data entries d1..d7, linked in order._

Now let’s step through what happens during a **SELECT** versus an **INSERT**.

- **SELECT (read):** In MySQL 8, a read does the following:

  1. Acquire an S-lock on the index (global).
  2. Acquire an S-lock on the _root_ page, then the next level, and so on, down to the _leaf_ page where the row resides.
  3. Read the data from the leaf.
  4. Release all locks (leaf and internal) except the index lock, which was already dropped once leaf was found.

  In pseudocode:

  ```pseudocode
  lock(index, S);
  for each level from root to leaf:
      lock(current_page, S);
  read data at leaf;
  release locks on root and internal pages;
  // (Index lock is auto-released after locating leaf)
  ```

  Because they are all S-locks, two concurrent reads can hold them together. Each query holds locks only while traversing; once done, all locks are released.

- **INSERT (no split):** Suppose we insert a new row that fits into a leaf without splitting:

  1. Acquire S-lock on index and each page down to leaf (same as read).
  2. On reaching the leaf, upgrade or acquire an X-lock on that leaf page.
  3. Insert the row into the leaf page (there is space).
  4. Release the S-locks on the internal pages (index lock was dropped after finding leaf).

  Pseudocode:

  ```pseudocode
  lock(index, S);
  for each level down to target leaf:
      lock(page, S);
  lock(leaf_page, X);  // now we have exclusive write lock on the leaf
  insert row into leaf_page;
  release S-locks on internal pages;
  ```

- **INSERT (with page split):** If the leaf is full, a _page split_ is needed (SMO). In MySQL 8:

  1. Acquire SX-lock on the index to signal an upcoming structure change.
  2. Traverse as usual with S-locks on each page down the tree.
  3. Upon finding the full leaf, convert that leaf (and possibly one of its neighbors) to X-locks for splitting. Also Sx-lock the root/page range as needed.
  4. Perform the split: create a new page, redistribute keys.
  5. Release all locks after the split is done.

  Pseudocode:

  ```pseudocode
  lock(index, SX);   // intent to modify structure
  for each level down to leaf:
      lock(page, S);
  if (leaf_page is full):
      lock(leaf_page, X);
      split leaf_page into two pages, adjusting parent;
      // if parent splits, repeat similarly up the tree
  release locks on affected pages;
  ```

  The SX lock allowed other sessions to read the tree concurrently (they held S-locks), but it prevented another session from starting _another_ SMO at the same time.

Throughout, the key idea is **latch coupling**: for example, the parent page stays locked until the child is locked. This means we only ever drop a page lock once we're sure the next page is safely locked.

## Conclusion

MySQL 8’s InnoDB B+ tree locking is a trade-off: we swap simplicity for scalability. By locking individual pages (even internal ones) and introducing the SX intent lock, we allow many readers and simple writers to proceed in parallel. In effect, _the system becomes more concurrent but also more complex_. As one blog put it:

> _"MySQL 8.0 introduces significant improvements over 5.6 by allowing concurrent reads during SMOs and refining the lock mechanisms"._

From a broader perspective, this underscores a general principle: **There is no perfect design**. A coarse approach (one lock per index) was simple and fast under moderate load but broke under contention. The fine-grained approach works better for heavy loads, _yet_ adds code complexity and rare edge cases. In my view, this reflects a common pattern in software design. We gain performance or concurrency by adding complexity, and we accept trade-offs. Understanding those trade-offs is key.

Overall, this lecture on InnoDB’s advanced locking left me with the insight that database internals often mirror life: a _yin-yang_ balance. More power (concurrency) comes with more responsibility (complexity), and every solution has its limits.
