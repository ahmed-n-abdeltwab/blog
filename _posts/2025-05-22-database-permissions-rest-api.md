---
layout: article
title: "Best Practices for Database Permissions in REST API Development"
date: 2025-05-22
modify_date: 2025-05-22
excerpt: "This lecture explains how to secure databases in REST API apps by using separate users with limited permissions for each route, avoiding risks like SQL injection."
tags: ["Database", "Security", "REST API", "Permissions", "LectureNotes"]
mathjax: false
mathjax_autoNumber: false
key: "database-permissions-rest-api"
---

# Introduction
Imagine a hacker sneaking into your app and deleting all your data with one command. Scary, right? This lecture is about keeping databases safe when building REST APIs. It shows how to avoid big mistakes, like letting one powerful user control everything. The goal is to learn why using separate **database users** with specific permissions for each API route is smarter and safer. The key idea? Don’t give your app more power than it needs—limit it to protect your data from attacks like **SQL injection**.

# Core Concepts/Overview
The main topic is about securing databases in REST API apps. Instead of using one **admin user** with full control (like dropping tables), the lecture suggests creating different users for different tasks. Each user gets only the permissions they need—like reading, adding, or deleting data. This way, even if someone hacks your app, they can’t do much damage.

# Key Characteristics
- **Separate Users:** Make different **database users** for each job (e.g., one for reading, one for adding, one for deleting).
- **Limited Permissions:** Give each user only the permissions they need—no extras like dropping tables.
- **Connection Pools:** Use **connection pooling** to handle multiple database connections smoothly for each route.

# Advantages & Disadvantages
- **Advantages:**
  - *Safer app:* Limits damage from hacks like SQL injection.
  - *More control:* You decide exactly what each user can do.
- **Disadvantages:**
  - *More work:* Setting up multiple users and pools takes time.
  - *Extra effort:* Managing it all can feel complicated.

# Practical Implementations/Examples
The lecture shows how to set this up with a simple to-do app using **NodeJS** and **Postgres**. Here’s what I noted:
1. **Create Users:** Make three users—`db_read`, `db_create`, `db_delete`—with SQL commands.
   - `db_read` only gets `SELECT` permission.
   - `db_create` gets `INSERT` and `USAGE` (for sequences).
   - `db_delete` gets `DELETE` and `SELECT` (to find rows).
2. **Set Permissions:** Assign these permissions in **PgAdmin** or with SQL like `GRANT SELECT ON todos TO db_read;`.
3. **Use Pools:** In the app, create separate **connection pools** for each user and link them to routes:
   - Read route uses `db_read_pool`.
   - Add route uses `db_create_pool`.
   - Delete route uses `db_delete_pool`.

> “If someone sneaks in an SQL injection, they can’t drop your table if the user doesn’t have that power.”

# Conclusion
This lecture taught me how important it is to lock down database access in REST APIs. Using separate **database users** with just the right permissions keeps things safe and limits risks. It’s a bit more work, but worth it for security. I’ll remember to avoid using one big admin user—splitting it up makes way more sense!
