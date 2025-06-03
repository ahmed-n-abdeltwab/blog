---
layout: article
title: "Understanding Database Engines: MyISAM, InnoDB, and Beyond"
date: 2025-05-12
modify_date: 2025-05-12
excerpt: "A detailed exploration of database engines like MyISAM, InnoDB, Aria, LevelDB, RocksDB, SQLite, and more, covering their features, use cases, and how to switch engines in MySQL."
tags:
  [
    "Database",
    "DatabaseEngines",
    "MyISAM",
    "InnoDB",
    "Transactions",
    "ACID",
    "LectureNotes",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: database-engines-overview
---

## Understanding Database Engines: MyISAM, InnoDB, and Beyond

## Introduction

Imagine your database crashing mid-operation, leaving your data corrupted and your application unusable. That’s the kind of nightmare that keeps database engineers up at night. This lecture dives into the world of **database engines**, the unsung heroes that manage how data is stored, retrieved, and manipulated on disk. The goal is to understand what database engines are, explore popular ones like **MyISAM**, **InnoDB**, **Aria**, **LevelDB**, **RocksDB**, and **SQLite**, and see how they differ in features and use cases. We’ll also learn how to switch engines in **MySQL** through a practical demo.

The lecture references a real-world issue: a **MySQL** database crash that corrupted a **MyISAM** table, requiring a repair to restore access. The _key revelation_ is that choosing the right database engine can make or break your application, depending on whether you need speed, transactional safety, or crash recovery.

## Core Concepts/Overview

A **database engine** (or **storage engine**) is a software library that handles low-level tasks like storing data on disk and performing **CRUD** operations (Create, Read, Update, Delete). It’s the backbone of a **Database Management System (DBMS)**, which adds features like client-server communication or replication. Engines can be simple, like a key-value store, or complex, supporting **ACID** transactions (**Atomicity**, **Consistency**, **Isolation**, **Durability**).

The lecture covers several engines:

- **MyISAM**: Fast but lacks transaction support.
- **InnoDB**: Transactional, ACID-compliant, and widely used.
- **Aria**: A crash-safe fork of MyISAM.
- **LevelDB**: Optimized for fast inserts on SSDs, no transactions.
- **RocksDB**: An enhanced fork of LevelDB with transactions.
- **SQLite**: An embedded database for local use.
- **BerkeleyDB**: An older key-value store.
- **XtraDB**: A fork of InnoDB, now less common.

> “A database engine is nothing but a library that takes care of disk storage and CRUD operations.” — Lecture

The lecture also explains why engines are separated from the DBMS: it allows flexibility to swap engines based on use cases, like high-speed inserts or transactional safety.

## Key Characteristics

### MyISAM

- **Structure**: Uses **B-tree** indexes that point directly to row offsets on disk.
- **Features**: Fast inserts, no transaction support, table-level locking.
- **Issues**: Updates/deletes are slow due to index updates; prone to corruption on crashes.
- **Ownership**: Owned by Oracle, originally developed by a Swedish company.

### InnoDB

- **Structure**: Uses **B+ tree**, requires a primary key, secondary indexes point to the primary key.
- **Features**: ACID-compliant, supports transactions, foreign keys, row-level locking.
- **Advantages**: Replaces MyISAM for transactional needs; robust for concurrent users.
- **Ownership**: Also Oracle-owned.

### Aria

- **Origin**: Created by Michael Widenius (MySQL founder) as a MyISAM fork for **MariaDB**.
- **Features**: Similar to MyISAM but crash-safe, used for MariaDB system tables.
- **Naming**: Named after Widenius’ daughter, like MariaDB and MySQL.

### LevelDB

- **Origin**: Developed by Google in 2011 for high-speed inserts on SSDs.
- **Structure**: Uses **Log-Structured Merge (LSM)** trees, no B-tree balancing.
- **Features**: No transactions, optimized for writes, write-ahead logs for crash recovery.
- **Use Cases**: Bitcoin Core, AutoCAD, Minecraft Pocket Edition.

### RocksDB

- **Origin**: Facebook’s 2012 fork of LevelDB.
- **Features**: Adds transactions, multi-threaded compaction, ACID support.
- **Use Cases**: MyRocks (MySQL storage engine), MongoRocks (MongoDB).

### SQLite

- **Origin**: Created in 2000 by Dwayne Richard Hipp for local storage.
- **Features**: Embedded database, B-tree-based, ACID-compliant, no row-level locking.
- **Use Cases**: Browsers (Web SQL), operating systems, software.

### BerkeleyDB

- **Origin**: Developed in 1994 by Sleepycat, now Oracle-owned.
- **Features**: Key-value store, embedded, supports locks.
- **Use Cases**: Formerly used in Bitcoin Core, memcacheDB.

### XtraDB

- **Origin**: MariaDB’s fork of InnoDB.
- **Issues**: Couldn’t keep up with InnoDB’s features; MariaDB switched back to InnoDB in version 10.2.

## Advantages & Disadvantages

### MyISAM

- **Advantages**:
  - Fast inserts (writes to end of file).
  - Simple index structure for quick reads.
- **Disadvantages**:
  - No transactions or row-level locking.
  - Slow updates/deletes due to index updates.
  - Crash-prone, requiring table repairs.

### InnoDB

- **Advantages**:
  - Transactional and ACID-compliant.
  - Row-level locking for concurrent users.
  - Supports foreign keys and tablespaces.
- **Disadvantages**:
  - Slower than MyISAM for non-transactional workloads.
  - More complex due to primary key requirements.

### Aria

- **Advantages**:
  - Crash-safe, unlike MyISAM.
  - Tailored for MariaDB system tables.
- **Disadvantages**:
  - Still lacks transactions, like MyISAM.

### LevelDB

- **Advantages**:
  - Extremely fast inserts on SSDs (O(1) complexity).
  - No B-tree rebalancing.
- **Disadvantages**:
  - No transaction support.
  - Not suited for heavy updates/deletes.

### RocksDB

- **Advantages**:
  - Transactional and ACID-compliant.
  - High performance for reads and writes.
  - Multithreaded for better scalability.
- **Disadvantages**:
  - Complex, may have trade-offs not fully explored in the lecture.

### SQLite

- **Advantages**:
  - Lightweight, embedded, ACID-compliant.
  - Widely used in local applications.
- **Disadvantages**:
  - No row-level locking, single-user focus.
  - Limited for multi-user scenarios.

## Practical Implementations/Examples

The lecture includes a hands-on demo using a **MySQL Docker container** to show how to switch engines and test transaction behavior.

### Steps to Set Up MySQL and Switch Engines

1. **Spin Up MySQL Docker Container**:

   ```bash
   docker run --name mysql1 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:8
   ```

   - Maps port 3306, sets root password, uses MySQL version 8.

2. **Access Container**:

   ```bash
   docker exec -it mysql1 bash
   mysql -u root -ppassword
   ```

3. **Create Database and Tables**:

   ```sql
   CREATE DATABASE test;
   USE test;
   CREATE TABLE employees_myisam (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name TEXT
   ) ENGINE=MyISAM;
   CREATE TABLE employees_innodb (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name TEXT
   ) ENGINE=InnoDB;
   ```

4. **List Supported Engines**:

   ```sql
   SHOW ENGINES;
   ```

   - Displays MyISAM, InnoDB, CSV, and others if installed (e.g., RocksDB).

### Testing Transactions

The lecture demonstrates transaction behavior using **Node.js**:

- **MyISAM**: No transaction support. Inserts are visible immediately, even without committing.

  ```javascript
  async function connectMyISAM() {
    const con = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "password",
      database: "test",
    });
    await con.beginTransaction();
    await con.query("INSERT INTO employees_myisam (name) VALUES (?)", [
      "Hussein",
    ]);
    // No commit, but data is visible to other clients
  }
  ```

- **InnoDB**: Supports transactions. Inserts are only visible after committing.

  ```javascript
  async function connectInnoDB() {
    const con = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "password",
      database: "test",
    });
    await con.beginTransaction();
    await con.query("INSERT INTO employees_innodb (name) VALUES (?)", [
      "Hussein",
    ]);
    // Data not visible until commit
    await con.commit();
  }
  ```

> “MyISAM doesn’t support transactions. The moment you insert, it’s committed. You’re out of luck.” — Lecture

## Conclusion

This lecture opened my eyes to the critical role of **database engines** in shaping how data is managed. **MyISAM** is great for fast, non-transactional workloads but risky due to crash vulnerabilities. **InnoDB** shines for transactional safety and concurrency, making it the default for modern MySQL and MariaDB. **Aria** fixes MyISAM’s crash issues, while **LevelDB** and **RocksDB** cater to high-speed SSD workloads, with RocksDB adding transactional power. **SQLite** is perfect for local, embedded use, and **BerkeleyDB** shows the evolution of key-value stores.

_Reflecting on this_, I realize choosing an engine depends heavily on the use case—speed vs. safety, local vs. multi-user. The MySQL demo was a game-changer, showing how easy it is to switch engines and test their behavior. I’ll definitely refer back to these notes when designing databases, ensuring I pick the right engine for the job. Next, I’m curious to explore **RocksDB** in depth and compare its performance with **InnoDB** for real-world workloads.
