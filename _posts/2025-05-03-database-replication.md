---
layout: article  
title: "Understanding Database Replication: Master-Slave vs. Multi-Master"  
date: 2025-05-03  
modify_date: 2025-05-03  
excerpt: "Explores database replication types (Master-Slave vs. Multi-Master), synchronous vs. asynchronous modes, and a hands-on Postgres 13 demo."  
tags: [Database, Replication, Master-Slave, Multi-Master, Postgres, LectureNotes]  
mathjax: false  
key: database-replication  
---

# Introduction  
**Pain Point:** Imagine your database crashes, and users can’t access critical data. Without redundancy, downtime becomes a nightmare.  
**Overview:** This lecture dives into **database replication**—a strategy to ensure data redundancy, fault tolerance, and scalability. Key topics:  
- **Master-Slave** vs. **Multi-Master** replication.  
- **Synchronous** vs. **Asynchronous** replication trade-offs.  
- A **Postgres 13 demo** to set up replication.  
**Key Revelation:** Replication isn’t just about backups—it’s a balance between *consistency*, *availability*, and *scalability*.  

---

# Core Concepts  
## 1. Master-Slave Replication  
- **Master Node:** Handles **all writes** (DDL/DML operations).  
- **Slave Nodes:** Read-only replicas synced with the master.  
- **Workflow:**  
  - Writes go to the master.  
  - Changes propagate to slaves via TCP (e.g., Postgres Write-Ahead Logs).  
- *Insight:* Simple to implement, no write conflicts, but a single point of failure (master).  

## 2. Multi-Master Replication  
- **Multiple Masters:** All nodes accept writes.  
- **Conflict Risk:** Concurrent writes can clash (e.g., two users updating the same record).  
- *Insight:* Scales writes but requires **conflict resolution** logic (complex to implement).  

## 3. Synchronous vs. Asynchronous  

| **Synchronous**               | **Asynchronous**              |  
|--------------------------------|--------------------------------|  
| Client waits for writes to master **and** replicas. | Client gets confirmation after master write. |  
| Strong consistency, slower writes. | Faster writes, eventual consistency. |  
| Example: Financial transactions. | Example: Social media likes. |  

---

# Key Characteristics  
- **Master-Slave Pros:**  
  - Simple setup.  
  - Read scalability (slaves handle queries).  
  - Geographic distribution (slaves in multiple regions).  
- **Master-Slave Cons:**  
  - Master failure halts writes.  
  - Replication lag (eventual consistency).  

- **Multi-Master Pros:**  
  - Write scalability.  
  - No single point of failure.  
- **Multi-Master Cons:**  
  - Conflict resolution complexity.  
  - Higher latency in distributed setups.  

---

# Practical Demo: Postgres 13 Replication  
**Goal:** Set up a Master-Slave replication using Docker.  

## Steps:  
1. **Spin Up Containers:**  
   ```bash  
   # Master  
   docker run --name pg-master -p 5432:5432 -v /replication/master_data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=postgres -d postgres:13  

   # Slave  
   docker run --name pg-slave -p 5433:5432 -v /replication/slave_data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=postgres -d postgres:13  
   ```  

2. **Copy Master Data to Slave:**  
   - Stop both containers.  
   - Replace slave’s data folder with a copy of the master’s.  

3. **Configure Replication:**  
   - **Master:** Edit `pg_hba.conf` to allow replication.  
     ```  
     host replication postgres 0.0.0.0/0 md5  
     ```  
   - **Slave:** Update `postgresql.conf` with master’s connection details.  
   - Create `standby.signal` in the slave’s data folder to enable read-only mode.  

4. **Test:**  
   - Create a table on the master—it appears on the slave instantly.  
   - Attempting writes on the slave throws an error (read-only).  

> **Demo Insight:** Synchronous replication ensures consistency but adds latency. Asynchronous is faster but risks data lag.  

---

# Conclusion  
- **Use Master-Slave** for read-heavy apps where eventual consistency is acceptable.  
- **Avoid Multi-Master** unless write scalability is critical and conflicts are manageable.  
- **Synchronous Replication:** Ideal for financial systems.  
- **Asynchronous Replication:** Suits social/media apps where minor delays are tolerable.  

*Final Thought:* Replication isn’t one-size-fits-all. Choose based on your app’s consistency needs, scalability goals, and tolerance for complexity.  
```
