---
layout: article
title: "How Databases Store Data on Disk"
date: 2025-06-11
modify_date: 2025-06-11
excerpt: "A lecture explaining how databases store data on HDDs and SSDs, including block organization and the impact of data structures like B-trees and LSM trees."
tags:
  [
    "Database",
    "Storage",
    "HDD",
    "SSD",
    "LectureNotes",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: database-storage-on-disk
---

## Lecture Notes: How Databases Store Data on Disk

## Introduction

Today, I watched a fascinating lecture by Hussein that opened my eyes to how databases store data on disk. He kicked things off with a relatable analogy about washing dishes—specifically, scrubbing off stubborn egg yolk—to show how complex and underappreciated a computer’s work can be. This hooked me right away, making me curious about the hidden mechanics of databases.

The lecture was sparked by an audience question, which I thought was cool because it showed how real-world curiosity drives learning. Hussein’s goal was clear: to break down how databases store data on disk, comparing Hard Disk Drives (HDDs) and Solid State Drives (SSDs). _I realized that even simple database operations rely on intricate processes tied to the hardware._

## Core Concepts

Databases don’t just dump data randomly on a disk; they organize it carefully to make storage and retrieval efficient. The lecture focused on how this works differently on HDDs and SSDs, using a simple example of a table with a single 32-bit integer field (4 bytes per row).

### Hard Disk Drives (HDDs)

HDDs are mechanical devices with spinning platters, divided into tracks and sectors. Each sector holds blocks of data, typically 512 bytes. Here’s how databases use HDDs:

- **Data Insertion**: When you add a row (e.g., a 4-byte integer), it’s stored in a block. Multiple rows are packed into one block—up to 128 rows in a 512-byte block—to save space.
- **Metadata and Retrieval**: The database keeps metadata, like a map, to track each row’s location (e.g., platter 1, track 7, sector 5, block 2). To read a row, it finds the block using this metadata.
- **Reading Data**: Reading involves pulling the entire block into memory, not just one row. This is slow because the HDD’s read/write head must physically move to the right spot, and the platter needs to spin to the correct sector.
- **Writing Data**: To update a row, the database reads the block, updates it in memory, and writes the whole block back to the same spot. HDDs can handle repeated writes without much wear.

_I was surprised by how much physical movement is involved—it really slows things down!_

### Solid State Drives (SSDs)

SSDs are different—they have no moving parts, using blocks and pages for storage. This makes them faster but introduces new challenges:

- **Data Storage**: Like HDDs, SSDs store multiple rows in a block (e.g., 128 rows in a 512-byte block). Metadata maps rows to specific blocks and pages (e.g., block 17, page 8).
- **Reading Data**: Reading is much faster because SSDs use electronic access, not mechanical movement. The database pulls the entire block into memory, similar to HDDs.
- **Writing Data**: Updating data is trickier. SSDs don’t overwrite existing data; they write updates to new pages. This helps manage wear but requires extra steps to keep data organized.
- **Endurance**: SSDs have a limited number of write cycles per block. Frequent updates can wear out blocks, reducing the SSD’s lifespan.

_It’s amazing how SSDs are so fast, but their lifespan depends on how we write data._

## Key Characteristics

Here’s a quick comparison of HDDs and SSDs in database storage:

| **Feature**           | **HDDs**                           | **SSDs**                          |
| --------------------- | ---------------------------------- | --------------------------------- |
| **Structure**         | Spinning platters, tracks, sectors | Blocks and pages, no moving parts |
| **Read/Write Speed**  | Slower due to mechanical movement  | Faster due to electronic access   |
| **Endurance**         | Durable for frequent writes        | Limited write cycles per block    |
| **Data Organization** | Blocks store multiple rows         | Blocks/pages store multiple rows  |

## Advantages & Disadvantages

- **HDDs**:

  - **Advantages**: Cheaper for large storage needs, durable for frequent writes with no significant wear limits.
  - **Disadvantages**: Slower, especially for random access, due to mechanical delays.

- **SSDs**:
  - **Advantages**: Much faster read and write speeds, ideal for databases needing quick queries.
  - **Disadvantages**: More expensive, limited endurance makes frequent updates a concern.

_I hadn’t realized how much the choice of storage affects database performance—it’s not just about speed!_

## Practical Implementations

The lecture highlighted how traditional database structures, like **B-trees**, can be problematic for SSDs. B-trees require in-place updates during rebalancing (e.g., when adding new data), which wears out SSD blocks faster. This was a lightbulb moment for me—_the way we structure data matters as much as the hardware!_

To solve this, some databases use **Log-Structured Merge (LSM) trees**, which are append-only. Instead of updating data in place, LSM trees add new data at the end of structures, reducing wear on SSDs. A great example is [RocksDB](https://rocksdb.org/), a high-performance key-value store developed by Facebook. RocksDB is optimized for SSDs, handling high insert volumes efficiently by minimizing random writes. It’s used in production by companies like Facebook and LinkedIn.

## Conclusion

This lecture showed me how much goes into something as “simple” as storing data in a database. HDDs are reliable and cost-effective but slow, while SSDs are fast but need careful management to avoid wearing out. Choosing the right storage and data structures, like LSM trees for SSDs, is key to optimizing database performance.
