---
layout: article
title: "Why Databases Read Pages Instead of Rows"
date: 2025-05-30
modify_date: 2025-05-30
excerpt: "This lecture explains why databases fetch entire pages instead of individual rows when executing SQL queries, covering variable-sized rows, disk storage limits, and how indexes work."
tags:
  [
    "Database",
    "SQL",
    "Indexing",
    "Storage",
    "LectureNotes",
    "Q&A",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: database-pages-vs-rows
---

## Introduction

Imagine running a SQL query and wondering why it feels slower than it should. This lecture tackles that frustration, answering a question from a student named Shiva Ashu about why databases don’t just grab the exact row we need. Instead, they fetch a whole **page** of data. The goal here is to understand why databases work this way, diving into how data is stored and retrieved. The key revelation? It’s not as simple as knowing where a row is—there are bigger forces at play, like disk limitations and row sizes.

## Core Concepts/Overview

Databases store data in fixed-size chunks called **pages**, not as individual rows. When you run a SQL query, the database pulls the entire page containing your row from the disk into memory, then filters out the row you want. Why not just get the row? Two big reasons:

- Rows aren’t all the same size, so the database can’t pinpoint their exact spot.
- Disks don’t let you grab tiny pieces of data—they force you to take bigger blocks.

This affects everything, even how **indexes** work, because they only guide the database to a page, not the exact row.

## Key Characteristics

- **Variable-sized rows:**

  - Rows can be big or small depending on the data (like long strings or NULL values).
  - This means the database doesn’t know exactly where a row sits in a page—it has to scan the page to find it.
  - _Fixed-size rows, like in MyISAM, solve this but waste space, so most databases avoid them._

- **Disk storage limits:**

  - Disks (hard drives or SSDs) work with **blocks**, not bytes.
  - Even if the database knew a row’s location, it’d still fetch the whole block—usually 4KB or more.

- **Indexes in action:**
  - An index points to a page and a **row ID**, not a precise spot.
  - The database fetches the page, then searches for the row ID inside it.

## Advantages & Disadvantages

- **Advantages:**

  - Fetching pages matches how disks work, making data retrieval smooth when you need multiple rows from one page.
  - It’s efficient for the system’s design, keeping things simple.

- **Disadvantages:**
  - You end up reading extra data you don’t need, which can slow things down if only one row matters.
  - More I/O (input/output) work happens than necessary.

## Conclusion

This lecture showed why databases grab entire **pages** instead of single rows: **variable-sized rows** mess up exact locations, and **disk storage** forces block-level reads. Indexes help, but they still rely on fetching pages. It’s not perfect—sometimes it feels wasteful—but it’s how things work today.

_Reflective thought:_ Hussien pushed us to question this. Could future tech, like byte-addressable disks, let databases grab just the rows we need? That’d be a game-changer!
