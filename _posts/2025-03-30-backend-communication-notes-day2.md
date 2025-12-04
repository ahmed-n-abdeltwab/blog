---
layout: article
title: "Backend Communication Fundamentals: Day 2 Notes"
date: 2025-03-30
modify_date: 2025-03-30
excerpt: "Exploring the differences between synchronous and asynchronous programming in backend communication."
tags: [
    "Backend",
    "Concurrency",
    "Node.js",
    "Asynchronous Programming",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: backend-communication-notes-day2
---

## **Backend Communication Fundamentals: Day 2**

## **Section 1: Synchronous vs. Asynchronous Programming**

### **Key Concepts**

#### **Synchronous Execution**

- Definition: A process is blocked while waiting for a response.
- The caller sends a request and cannot proceed until it gets a response.
- Comparable to a sine wave where client and server are "in sync".
- **Example:** A program requests the OS to read from disk → it gets removed from the CPU → resumes when data is ready.

#### **Asynchronous Execution**

- Definition: The caller can continue execution while waiting for a response.
- The request initiates an operation, and execution proceeds without blocking.
- Two primary ways to check for a response:
  1. **Polling methods** (e.g., `epoll` in Linux)
  2. **Callback mechanisms** (e.g., `io_uring` in Linux, I/O completion ports in Windows)
- **Example:** Sending an email while continuing other work, instead of waiting for an immediate reply.

---

## **Section 2: Real-Life Analogies**

### **Comparing Synchronous and Asynchronous Workflows**

| Scenario          | Synchronous                              | Asynchronous                                  |
| ----------------- | ---------------------------------------- | --------------------------------------------- |
| Asking a question | You wait for an answer before moving on. | You send an email and continue working.       |
| Chat apps         | Typing and waiting for a reply.          | Sending a message and getting notified later. |

---

## **Section 3: Implementation in Node.js**

### **Asynchronous Patterns in Node.js**

#### **Callbacks**

```javascript
readFile("large.dat", function onReadFinished(file) {
  // Handle file data
});
doWork(); // Execution continues immediately
```

#### **Promises**

```javascript
readFile("large.dat").then(function (file) {
  // Handle file data
});
```

#### **Async/Await**

```javascript
const file = await readFile("large.dat");
// Looks synchronous but is non-blocking
```

---

## **Section 4: Asynchronous Processing in Backend Systems**

### **Queue-Based Processing**

- Backend servers often use **message queues** to handle asynchronous tasks.
- A **client request** can immediately return a job ID while processing continues in the background.
- The client can check status later or get notified when processing is complete.

### **Methods for Checking Completion**

1. **Polling** - Client repeatedly checks for updates.
2. **Push notifications** - Server notifies the client when done.
3. **Long polling** - Client makes a request that remains open until data is available.
4. **Pub/Sub systems** - Clients subscribe to topics and get notified.

---

## **Section 5: Database-Specific Asynchronous Operations**

### **Asynchronous Commits (PostgreSQL)**

- **Synchronous Commit:** Waits until data is written to disk (ensures durability).
- **Asynchronous Commit:** Returns success before the data is committed (faster but riskier).

### **Asynchronous Replication**

- **Synchronous Replication:** Primary server waits for replicas to confirm before committing.
- **Asynchronous Replication:** Primary commits instantly, and replicas update later (higher performance, lower consistency).

---

## **Section 6: OS-Level Considerations**

### **File System Operations**

- OS often caches writes and flushes them asynchronously for performance.
- **Databases override this behavior** using `fsync` to ensure durability.
- **I/O Event Handling Mechanisms:**
  - `epoll` - Event-driven I/O notification.
  - `io_uring` - Asynchronous completion-based I/O handling.

---

## **Section 7: Key Vocabulary**

- **Context Switching**: Moving processes in/out of CPU execution.
- **Blocking**: Execution pauses until an operation completes.
- **Event Loop**: Node.js loop that handles callbacks, timers, etc.
- **Worker Threads**: Additional threads used for blocking tasks.
- **Write-Ahead Log (WAL)**: Database journal of changes.
- **fsync**: Command to bypass OS cache and write directly to disk.
- **Polling**: Repeatedly checking if data is ready.
- **Callbacks**: Functions executed when an operation completes.
- **Promises**: Objects representing eventual completion of async operations.
- **Queues**: Data structures for managing background workloads.

