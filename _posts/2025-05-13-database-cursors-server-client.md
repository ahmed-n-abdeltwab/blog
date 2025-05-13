---
layout: article
title: "Understanding Server-Side and Client-Side Database Cursors"
date: 2025-05-13
modify_date: 2025-05-13
excerpt: "Notes on server-side and client-side database cursors, their differences, pros and cons, and how to use them with PostgreSQL and Python."
tags: [Database, Cursors, PostgreSQL, Python, Performance, Memory Management, LectureNotes]
key: database-cursors-server-client
---

# Introduction

Working with big datasets in databases can be really tough. Imagine trying to load a million rows into your program and everything slows down or crashes because there’s not enough memory. That’s a real problem! This lecture explains **server-side** and **client-side cursors**, two ways to handle data in databases like PostgreSQL using Python. We’ll learn what they are, how they work, and when to use them. The big lesson here is figuring out which cursor type fits your needs—saving memory or speeding things up.

# Core Concepts

## Client-Side Cursor

A **client-side cursor** pulls all the data from the database to your computer (the client) when you run a query. For example, if you ask for a million rows, it fetches everything at once and stores it in your program’s memory. It’s simple but can be tricky with big data.

## Server-Side Cursor

A **server-side cursor** keeps the data on the database server. You run the query there, and then fetch small pieces of data when you need them, like 50 rows at a time. It’s like asking the server, “Hey, just give me a little bit now,” instead of taking everything.

# Key Characteristics

### Client-Side Cursor
- Fetches all data at once.
- Quick for small datasets.
- Uses a lot of memory if the data is big.

### Server-Side Cursor
- Fetches data in small chunks.
- Good for big datasets.
- Needs more trips to the server.

# Advantages & Disadvantages

## Client-Side Cursor

- **Advantages:**
  - Less work for the server—it sends everything once.
  - Fast for small data since it’s all on your computer already.

- **Disadvantages:**
  - Takes up too much memory with big datasets.
  - Can slow down your network if you’re moving a lot of data.

## Server-Side Cursor

- **Advantages:**
  - Saves memory on your computer by taking small pieces.
  - Great for big datasets, like processing a million rows step-by-step.

- **Disadvantages:**
  - More work for the server to keep the data ready.
  - Slower because you keep asking the server for more rows.
  - Can cause problems if you forget to close it (*leaking cursors*).

# Practical Implementations

The lecture showed how to use both cursors in Python with PostgreSQL using the `psycopg2` library.

### Client-Side Cursor Example

This code fetches all data to the client and grabs the first 50 rows:

```python
import psycopg2
import time

conn = psycopg2.connect(host="localhost", database="mydb", user="user", password="pass")
cursor = conn.cursor()  # No name = client-side
start = time.time()
cursor.execute("SELECT * FROM employees")
print(f"Execute query took {(time.time() - start) * 1000} milliseconds")
start = time.time()
rows = cursor.fetchmany(50)  # Get 50 rows
print(f"Fetching 50 rows took {(time.time() - start) * 1000} milliseconds")
cursor.close()
conn.close()
```

In the lecture, executing the query took 845 milliseconds for a million rows, but fetching 50 rows was super fast (almost 0 milliseconds) because the data was already on the client.

### Server-Side Cursor Example

This code keeps the data on the server and fetches 50 rows at a time:

```python
import psycopg2
import time

conn = psycopg2.connect(host="localhost", database="mydb", user="user", password="pass")
cursor = conn.cursor(name="my_cursor")  # Named = server-side
start = time.time()
cursor.execute("SELECT * FROM employees")
print(f"Execute query took {(time.time() - start) * 1000} milliseconds")
start = time.time()
rows = cursor.fetchmany(50)  # Get 50 rows from server
print(f"Fetching 50 rows took {(time.time() - start) * 1000} milliseconds")
cursor.close()
conn.close()
```

Here, executing the query was fast (3 milliseconds), but fetching 50 rows took about 2 milliseconds each time because it goes back to the server.

# Conclusion

These notes taught me the difference between **client-side cursors** (fast for small data, heavy on memory) and **server-side cursors** (better for big data, but more server work). The key is to pick the right one: use client-side for small stuff and server-side when memory is tight or data is huge. *It’s cool how a small change like naming a cursor can make such a big difference!* I’ll remember to close server-side cursors to avoid trouble.

