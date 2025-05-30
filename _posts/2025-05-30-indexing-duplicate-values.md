---
layout: article
title: "Understanding Indexing with Duplicate Values"
date: 2025-05-30
modify_date: 2025-05-30
excerpt: "A lecture note on how indexing works with columns that have duplicate values, covering index selectivity and practical examples."
tags: [Indexing, Database, LectureNotes, PostgreSQL, DuplicateValues, QA]
key: indexing-duplicate-values
---

## Introduction

Picture this: you’re trying to make your database faster with an index, but the column you pick has tons of duplicate values. Suddenly, you’re stuck wondering, “Does this even work?” This lecture tackles that exact problem. It’s all about understanding how indexing handles columns with duplicates. The goal is to figure out how indexes are stored and whether they’re useful in these cases. The big takeaway? *Indexing isn’t always helpful if duplicates make it less selective.*

## Core Concepts/Overview

The lecture focuses on **indexing**—a way to speed up database searches. But when a column has duplicate values, things get tricky. The key idea here is **index selectivity**. This means how well an index can shrink the number of rows you need to check. If a column has few unique values (like "male" or "female"), the index isn’t selective, and it might not help much. The more unique the values, the better the index works.

## Key Characteristics

- **Naive Approach**: Normally, an index lists every duplicate value separately. For example, if "code zero" appears 10 times, it’s stored 10 times in the index. This makes the index big and bulky.
- **PostgreSQL Deduplication**: In newer versions (like PostgreSQL 13), there’s a smarter way. It groups duplicates together, storing "code zero" once with a list of all the rows it points to. This saves space.

## Advantages & Disadvantages

### Advantages
- **Faster Searches**: If the index is selective (fewer duplicates), queries run quicker.
- **Smaller Size**: With deduplication, the index takes up less space.

### Disadvantages
- **Bloated Indexes**: Without deduplication, lots of duplicates make the index huge and slow.
- **Extra Work**: Adding and updating the index can slow down the database if it’s not selective.

## Practical Implementations/Examples

The lecture gave some real examples:
1. **Gender Column**: Imagine a table with 100 million rows and a "gender" column (male, female, unspecified). Indexing it alone is useless because each value appears millions of times. Querying "all males" still scans tons of data.
2. **Project Code**: Now picture a "project code" column with 10 codes (code 0 to code 9). Each code repeats across rows. Indexing it might help if the codes are evenly spread and you’re searching for one code.
3. **Combining Indexes**: Pairing a low-selectivity column (like gender) with another column can make the index more useful.

> "If you’re indexing something with a lot of duplicates, really think about it hard. Test it!" – Hessien

## Conclusion

This lecture taught me that indexing columns with duplicates isn’t straightforward. **Index selectivity** is the key—low selectivity means the index might be a waste. I’ll remember to test my indexes with real queries using `EXPLAIN` to see if they actually help. It’s all about finding the right balance for my database!
