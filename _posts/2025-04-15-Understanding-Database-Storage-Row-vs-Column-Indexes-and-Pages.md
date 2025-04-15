---
layout: article
title: "Understanding Database Storage: Row vs Column, Indexes, and Pages"
date: 2025-04-15
modify_date: 2025-04-15
excerpt: "A comprehensive guide to database storage models, indexing, and page management, covering row-based vs column-based systems, primary/secondary keys, and I/O optimization."
tags: [Database, Storage, Indexes, Row-Based, Column-Based, Pages, LectureNotes]
mathjax: false
key: database-storage-models
---

# Database Storage Models: Row-Based vs Column-Based

## Row-Oriented Databases
- **Storage Mechanism**: Stores entire rows sequentially on disk.  
  Example:  
  ```
  1001, John, Smith, 111, 101000  
  1002, Kary, White, 222, 102000  
  ```
- **Pros**:  
  - Efficient for transactional workloads (OLTP).  
  - Fast writes and single-row reads.  
  - Ideal for queries requiring multiple columns (e.g., `SELECT *`).  
- **Cons**:  
  - Inefficient for column-specific aggregations (e.g., `SUM(salary)`).  
  - Higher I/O overhead for analytical queries.  

## Column-Oriented Databases
- **Storage Mechanism**: Stores columns separately.  
  Example:  
  ```
  IDs: 1001, 1002, 1003  
  Salaries: 101000, 102000, 103000  
  ```
- **Pros**:  
  - Excellent compression (similar data types grouped).  
  - Fast aggregations and analytical queries (OLAP).  
  - Reduced I/O for column-specific operations.  
- **Cons**:  
  - Slow writes (updates across multiple columns).  
  - Poor performance for multi-column queries (e.g., `SELECT *`).  

---

# Tables and Indexes on Disk

## Key Concepts
1. **Page**:  
   - Fixed-size storage unit (e.g., 8KB in PostgreSQL).  
   - Contains multiple rows or column values.  
   - Example: A page with 3 rows:  
     ```
     Page 0: Row1, Row2, Row3  
     Page 1: Row4, Row5, Row6  
     ```
2. **Heap**:  
   - Unordered collection of pages storing all table data.  
   - Scanning the heap is slow (full table scans).  
3. **I/O Operations**:  
   - Reading a page fetches all its rows/columns.  
   - Goal: Minimize I/O by using indexes.  

## Indexes and B-Trees
- **Primary Index (Clustered Index)**:  
  - Organizes the table around a key (e.g., primary key in MySQL).  
  - Example: Ordered rows by `emp_id`.  
- **Secondary Index**:  
  - Separate structure pointing to heap locations (e.g., PostgreSQL indexes).  
  - Requires extra I/O to fetch data from the heap.  
- **B-Tree Structure**:  
  - Balanced tree for fast lookups.  
  - Example: Index on `emp_id` maps values to page numbers.  

---

# Query Execution Examples

## Without Index
- Query: `SELECT * FROM emp WHERE emp_id = 10000`  
  - Scans all pages in the heap.  
  - High I/O cost (e.g., reading 333 pages).  

## With Index
- Query: `SELECT * FROM emp WHERE emp_id = 10000`  
  1. Traverse B-tree index to find `emp_id = 10000`.  
  2. Fetch corresponding page (e.g., Page 333).  
  3. Retrieve the row from the heap.  
  - Low I/O cost (2-3 page reads).  

---

# Primary vs Secondary Keys

| Feature                | Primary Key (Clustered)       | Secondary Key             |
|------------------------|-------------------------------|---------------------------|
| **Storage**            | Organizes table data          | Separate B-tree structure |
| **Performance**        | Fast for range queries        | Requires heap lookup      |
| **Use Case**           | Frequently queried columns    | Auxiliary search fields   |
| **Example**            | `emp_id` in MySQL             | `last_name` index in PG   |

---

# Page Management
- **Page Layout**:  
  - **Header**: Metadata (24 bytes in PostgreSQL).  
  - **ItemIds**: Pointers to row locations (4 bytes each).  
  - **Rows/Columns**: Actual data stored sequentially.  
- **Optimization**:  
  - Smaller rows → More rows per page → Better I/O efficiency.  
  - Larger pages reduce metadata overhead but increase read/write latency.  

---

**Key Takeaways**:  
- Use **row-based** databases for transactional systems (OLTP).  
- Use **column-based** databases for analytics (OLAP).  
- Indexes reduce I/O but add overhead for writes.  
- Page size and organization directly impact query performance.  
