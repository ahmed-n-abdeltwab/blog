---
layout: article  
title: "Evolution of MongoDB's Architecture: From MMAPv1 to Clustered Collections"  
date: 2025-05-14  
modify_date: 2025-05-14  
excerpt: "A summary of MongoDB’s internal changes, including the shift from MMAPv1 to WiredTiger and the new clustered collections, plus a look at SQL vs. NoSQL differences."  
tags: ["MongoDB", "Database", "NoSQL", "SQL", "Storage Engines", "LectureNotes"]  
mathjax: false  
mathjax_autoNumber: false  
key: mongodb-architecture-evolution  
---

## Introduction

Imagine your app slowing down because the database can’t keep up with updates. Frustrating, right? This lecture dives into how **MongoDB**, a popular NoSQL database, solved problems like this by changing its internal design over time. The goal? To explain how MongoDB’s *architecture* evolved and why it matters. We’ll cover its storage engines and the big difference between **SQL** and **NoSQL** databases. The key revelation: understanding these changes helps us build faster, smarter apps.

## Core Concepts/Overview

Databases have two main parts:  
- **API (Front End):** How we talk to the database (e.g., SQL commands or MongoDB’s `find()`).  
- **Storage Engine:** How data is saved and managed on disk (e.g., tables or documents).  

### SQL vs. NoSQL
- **SQL Databases:** Use tables with rows and columns. You must plan the structure ahead (fixed schema). The API is SQL.  
- **NoSQL Databases (like MongoDB):** Store data as documents (like JSON). No fixed structure—very flexible. Each NoSQL database has its own API.  

> "SQL is tables and rules; NoSQL is freedom with documents."

MongoDB’s strength is its *schemaless* design, making it easy for coding without strict rules.

## Key Characteristics

MongoDB’s storage engines changed over time to get better at speed and handling lots of users. Here’s how:

### 1. MMAPv1 (Early MongoDB)
- **What it did:** Saved documents in files using offsets (like a map to find data).  
- **Locking:** Started with one lock for the whole database, then improved to one lock per collection. Still slow for updates.  
- **Problem:** Changing a document’s size messed up the offsets, slowing things down.

### 2. WiredTiger (Since 2014)
- **What it did:** Used a B-tree structure (like a tree to organize data). Added compression to save space.  
- **Locking:** Locks only the document being changed—much better for multiple users.  
- **Change:** Added a hidden “record ID” for each document, but this meant two lookups to find data by `_id`.

### 3. Clustered Collections (MongoDB 5.3+)
- **What it did:** Made the `_id` field the main index (no hidden record ID).  
- **Result:** Faster lookups by `_id`—just one search instead of two.

## Advantages & Disadvantages

### MMAPv1
- **Pros:** Fast for reading if data doesn’t change. Simple setup.  
- **Cons:** Locks slowed updates. Changing sizes broke the system.

### WiredTiger
- **Pros:** Better for updates with document locks. Compression saves space.  
- **Cons:** Two lookups for `_id` searches made it slower for some tasks.

### Clustered Collections
- **Pros:** Quick `_id` searches. Like SQL’s primary key speed.  
- **Cons:** Secondary indexes can grow big if `_id` isn’t small (e.g., using UUIDs).

## Practical Implementations/Examples

The lecture didn’t give code, but these changes affect how we use MongoDB:  
- **MMAPv1:** Good for static data, like logs.  
- **WiredTiger:** Best for apps with lots of updates, like social media.  
- **Clustered Collections:** Great for lookups by `_id`, like user profiles.

## Conclusion

MongoDB went from simple but slow (MMAPv1) to flexible and fast (WiredTiger), and now even faster for key searches (clustered collections). Knowing this helps me pick the right setup for my projects. *It’s all about matching the engine to the job.* This lecture showed me why database insides matter—better design means better apps!
