---
layout: article
title: "Why Uber Switched from Postgres to MySQL: Lecture Notes"
date: 2025-06-22
modify_date: 2025-06-22
excerpt: "A summary of a lecture discussing Uber's 2016 migration from Postgres to MySQL, covering technical challenges, community backlash, and lessons on database choices."
tags:
  [
    "Database",
    "Postgres",
    "MySQL",
    "LectureNotes",
    "Uber",
    "Database Discussions",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Database Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: uber-database-migration
---

## Why Uber Switched from Postgres to MySQL: A Deep Dive

Choosing the right database is like picking the perfect tool for a job—it can make or break a project, especially for a company like Uber that handles massive amounts of data. In 2016, Uber decided to switch from PostgreSQL (Postgres) to MySQL, a move that stirred up a lot of debate in the tech world. In a recent lecture, Hussein breaks down the reasons behind this switch, based on an article by Uber Engineering ([Uber Engineering Blog](https://www.uber.com/en-EG/blog/postgres-to-mysql-migration/)), and shares his own thoughts on whether it was the right call. As someone learning about databases, I found this lecture eye-opening, and these are my personal notes to capture the key points.

Hussein points out that the Uber article got a lot of flak for its harsh tone toward Postgres. He quotes:

> "I remember that this article got a lot of backlash from the Postgres community and actually the whole database community to be honest, because of how the language used in this article severely criticized Postgres as if it's a bad database, right? They don't even mention that thing that they say, Hey, by the way, guys, this is just didn't work for us. It doesn't mean it won't work for you."

This sets the context: Uber had real issues with Postgres, but their article made it sound like Postgres was flawed for everyone, which wasn’t fair.

## Background: Uber’s Architecture Evolution

To understand why Uber made this switch, we need to look at their setup. Early on, Uber ran a **monolithic backend** in Python, with Postgres handling all data storage. As Uber grew, they moved to a **microservices architecture**, which demanded a database that could scale better. This shift led them to build a **schemaless database sharding layer** on top of MySQL, a surprising choice since MySQL is typically schema-based. Hussein found this move intriguing but questioned its logic, saying:

> "You have now schemaless. You have schemaless and using MySQL. Maybe there is something I’m missing here, but it does not seem natural to me."

This architectural change set the stage for the database migration.

## Core Concepts: Postgres vs. MySQL

Before diving into the reasons for the switch, let’s clarify what these databases are. **Postgres** is an open-source relational database known for its robustness, advanced features like JSONB, and strong consistency. **MySQL**, also open-source, is praised for its simplicity, speed, and widespread use in web applications. Both are powerful, but they handle things like writes, replication, and concurrency differently, which is where Uber’s problems—and solutions—came into play.

The lecture focuses on how Postgres’s design didn’t scale well for Uber’s specific needs, particularly their high write loads and cross-data-center replication. MySQL, with its different approach, offered a better fit for their new architecture.

## Pain Points with Postgres

Uber listed five main issues with Postgres that pushed them toward MySQL. Hussein walks through each one, agreeing with some but calling others into question. Here’s what I noted:

### 1. Inefficient Architecture for Writes

Postgres uses **Multiversion Concurrency Control (MVCC)**, which creates new versions of rows for updates. When a row changes, Postgres updates _all_ indexes (primary and secondary), leading to **write amplification**—a single update triggers multiple physical writes. Uber had _lots_ of indexes (Hussein mentions 700 in some cases!), which made this worse, especially on SSDs, where excessive writes shorten drive lifespan and slow performance.

Hussein questions Uber’s heavy index usage:

> "Why would you have this much indexes? Beats me. Do you really query on all of them? Do you really query on first name right or last name? That's why adding indexes is great. Adding too much indexes is just a bad idea."

This suggests some of Uber’s pain might have come from their own design choices.

### 2. Inefficient Data Replication

Postgres relies on a **Write Ahead Log (WAL)** for replication, logging physical changes to the disk. Because of write amplification, Uber’s WAL files were huge, requiring massive bandwidth to replicate data across data centers (e.g., West to East Coast). Hussein explains:

> "So the WAL changes. As they grow large, the bandwidth becomes expensive because they are very large and they're not making small updates, they're making large updates which are even larger."

This made replication costly and inefficient for Uber’s scale.

### 3. Issues with Table Corruption

Uber reported table corruption due to a bug in Postgres 9.2, where replicas returned inconsistent data (e.g., duplicate rows). Hussein isn’t convinced this was a good reason to switch, saying:

> "This is the most dumb section in this whole article. ... Software doesn't have bugs. You're adding a bug as a result. To move from Postgres to a MySQL like MySQL is perfect. That's just odd."

He argues that bugs are normal and fixable, making this a weak justification for abandoning Postgres.

### 4. Poor Replica MVCC Support

Postgres’s replication could interrupt queries on replicas when applying WAL changes, causing transaction failures. This was a problem for Uber, whose applications needed uninterrupted reads. Hussein notes this as a legitimate issue but points out that Postgres’s design prioritizes consistency over concurrent reads, which might not suit every use case.

### 5. Difficulty Upgrading to New Releases

Upgrading Postgres was a nightmare for Uber, often requiring them to rebuild databases from scratch. Hussein totally gets this one, sharing his own struggles:

> "Postgres upgrade is really painful, really painful. I've been there. I've been there from 9.3 to 9.4 to 9.5. I then just gives up. I just rather recreate my databases from scratch after that."

This operational headache was a big factor in Uber’s decision.

Here’s a table summarizing the pain points and Hussein’s take:

| **Pain Point**            | **Description**                                                        | **Hussein’s Critique**                                                  |
| ------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Inefficient Writes        | Write amplification due to MVCC and heavy indexing slowed performance. | Questions Uber’s excessive indexes; suggests better design could help.  |
| Inefficient Replication   | Large WAL files made cross-data-center replication costly.             | Valid issue, tied to write amplification and Uber’s scale.              |
| Table Corruption          | Bug in Postgres 9.2 caused replica inconsistencies.                    | Calls this a weak reason; bugs are fixable and not unique to Postgres.  |
| Poor Replica MVCC Support | Replication interrupted replica queries, causing failures.             | Legitimate limitation for Uber’s needs but a design choice in Postgres. |
| Difficulty Upgrading      | Complex upgrades often required rebuilding databases.                  | Agrees fully; shares personal experience of painful upgrades.           |

## How MySQL Addressed These Issues

MySQL offered solutions to Uber’s problems, making it a better fit for their needs. Here’s how it tackled each pain point:

- **Reduced Write Amplification**: In MySQL, secondary indexes point to the **primary key**, not directly to the disk. This means fewer updates are needed when a row changes, cutting down on write amplification. This was a big win for Uber, especially with their heavy indexing.

- **More Efficient Replication**: MySQL supports **statement-based replication**, where SQL statements are sent instead of physical changes, using less bandwidth than Postgres’s WAL. This made replication cheaper and faster, especially across data centers.

- **Better Replica MVCC Support**: MySQL’s replication treats changes as new transactions, allowing simultaneous reads and writes without blocking. This fixed the query interruption issues Uber faced with Postgres.

- **Simpler Upgrade Process**: While the lecture doesn’t dive deep here, it’s implied that MySQL upgrades were less painful, easing operational burdens.

- **Connection Handling**: MySQL uses a **thread-per-connection** model, which was more efficient than Postgres’s **process-per-connection** approach at the time. Hussein notes this difference is less significant now but was relevant for Uber’s scaling.

Uber also built a **schemaless sharding layer** on MySQL, which aligned with their microservices architecture. This custom solution let them manage data more flexibly, though Hussein found it an odd choice for a schema-based database like MySQL.

## Advantages and Disadvantages

To put this in perspective, let’s look at the pros and cons of each database for Uber’s use case:

### Postgres

- **Advantages**:
  - Robust and feature-rich (e.g., JSONB, full-text search).
  - Strong consistency and reliability.
- **Disadvantages** (for Uber):
  - Write amplification with heavy indexing.
  - Bandwidth-heavy replication due to large WAL.
  - Painful upgrades.

### MySQL

- **Advantages** (for Uber):
  - Reduced write amplification with efficient indexing.
  - Bandwidth-efficient replication modes.
  - Easier upgrades.
  - Suited Uber’s schemaless sharding layer.
- **Disadvantages**:
  - Lacks some of Postgres’s advanced features.
  - Concurrency model may not suit all workloads.

This comparison shows why MySQL was appealing for Uber’s specific needs, but it also highlights that Postgres wasn’t inherently “bad”—it just didn’t fit Uber’s scale and architecture.

## Practical Implementations

The lecture doesn’t provide code snippets or specific configurations, focusing instead on architectural concepts. However, Uber’s move to MySQL involved building a **schemaless sharding layer**, which allowed them to distribute data across multiple MySQL instances. This was key to their microservices setup, enabling flexible data management at scale. While I wish there were more technical details, the lecture emphasizes high-level decisions over low-level code.

## Personal Reflections and Conclusion

This lecture was a fascinating look at a real-world database migration. Uber’s switch from Postgres to MySQL was driven by legitimate challenges—write amplification, replication costs, and upgrade pain—but Hussein’s critiques made me think twice. For example, the table corruption issue seemed overblown, and the heavy indexing might have been a self-inflicted wound. It’s a reminder that sometimes the problem isn’t the tool but how it’s used.

> "As an engineer, you have to take pride of your work and the thing that you interface with. I believe that you have to understand what you're communicating with." - Hussein Nasser
