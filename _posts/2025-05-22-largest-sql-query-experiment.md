---
layout: article
title: "Experiment: Finding the Largest SQL Query a Database Can Handle"
date: 2025-05-22
modify_date: 2025-05-22
excerpt: "In this experiment, we test how large an SQL query can get before crashing a PostgreSQL database, using Node.js and Wireshark to monitor the process."
tags:
  [
    "SQL",
    "Database",
    "PostgreSQL",
    "Node.js",
    "Wireshark",
    "Performance",
    "LectureNotes",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: largest-sql-query-experiment
---

## Introduction

Have you ever sent an SQL query so big that your database just stops working? That’s the pain we’re tackling in this lecture. The goal is to find out how large an SQL query can be before the database server crashes. We use **Node.js** to send queries to a **PostgreSQL** database on **Elephant SQL**, and **Wireshark** to watch the network traffic. The key revelation? There’s a limit—and we hit it hard, crashing the server!

## Core Concepts/Overview

The experiment is simple: build an SQL query and make it bigger step by step. We start with a basic query:

```sql
SELECT * FROM table WHERE ID = 1
```

Then, we add more conditions like "OR ID = 2", "OR ID = 3", and so on, using a loop in Node.js. We test with 100, 1000, 10,000, 100,000, and 1,000,000 conditions. At each step, we check the **query size** in kilobytes and how many **TCP segments** it takes to send it, until the server can’t handle it anymore.

## Key Characteristics

Here’s what we found at each step:

- **100 conditions**:

  - Query size: ~1 KB
  - TCP segments: 1
  - Result: Works fine

- **1000 conditions**:

  - Query size: ~12.5 KB
  - TCP segments: 9
  - Result: Still works

- **10,000 conditions**:

  - Query size: ~125 KB
  - TCP segments: ~90
  - Result: Success, but slower

- **100,000 conditions**:

  - Query size: ~1.25 MB
  - TCP segments: 960
  - Result: Works, but takes time

- **1,000,000 conditions**:
  - Query size: ~12.5 MB (up to 14 MB)
  - TCP segments: Didn’t finish (_server crashed before sending fully_)
  - Result: **Server crash** with an error about another process dying

## Advantages & Disadvantages

Sending huge SQL queries has ups and downs:

- **Advantages**:

  - You can test database limits and learn how it behaves under stress.
  - Useful for understanding network and server performance.

- **Disadvantages**:
  - **Server crash**: Too big, and the database dies.
  - Slow performance: More **TCP segments** mean more waiting for acknowledgments.
  - Client struggles: Even generating the query can freeze the Node.js app.

## Practical Implementations/Examples

Here’s how we did it:

- **Setup**:

  - Database: PostgreSQL on Elephant SQL (free version).
  - Tool: Node.js to write and send queries.
  - Monitoring: Wireshark to track **TCP segments**.

- **Code**: We used a loop in Node.js to build the query:

  ```javascript
  let sql = "SELECT * FROM table WHERE ID = 1";
  for (let i = 2; i <= 1000000; i++) {
    sql += " OR ID = " + i;
  }
  console.log(sql.length / 1024 + " KB");
  ```

  This added "OR ID = i" up to a million times, then sent it to the server.

## Conclusion

This experiment showed that a PostgreSQL server (on a free Elephant SQL instance) can handle a query up to ~1.25 MB (100,000 conditions) with 960 **TCP segments**. But at ~12.5 MB (1,000,000 conditions), or even 14 MB, it crashes—sometimes before the query fully sends. A better server might take more, but even the client struggled to generate it. _Keep queries small and smart_ to avoid crashes and delays!
