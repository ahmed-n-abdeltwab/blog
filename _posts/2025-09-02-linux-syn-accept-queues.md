---
layout: article
title: "Linux SYN and Accept Queues"
date: 2025-09-02
modify_date: 2025-09-02
excerpt: "This lecture explains how Linux uses SYN and accept queues per listening socket during the TCP handshake, and how multiple server processes share the same socket and queues."
tags:
  [
    "Backend",
    "Programming",
    "LectureNotes",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
    "Q&A",
  ]
key: linux-syn-accept-queues
---

## Introduction

I recently watched a lecture about how the **Linux kernel** manages incoming TCP connections behind the scenes. It turns out that the kernel **queues** new connections in two stages, using a _SYN queue_ and an _accept queue_. This is tied to the TCP _three-way handshake_. The key insight is that these queues belong to the _listening socket_ itself (a file descriptor), not to each process. That means if a server has multiple worker processes (for example, Apache or Nginx workers), they can all _share_ the same listening socket and its queues.

_Example:_ Imagine a web server with 4 worker processes. The kernel creates one listening socket and for that socket it maintains two queues. All 4 processes can call `accept()` on the same socket, and the kernel manages which one gets the next connection.

> "During the TCP three-way handshake process, the Linux kernel maintains two queues, namely: **SYN Queue**; **Accept Queue**."

## Core Concepts / Overview

- **Listening socket:** When a process calls `listen()` on a bound socket, the kernel sets up two queues for that socket: the **SYN queue** (for half-open connections) and the **accept queue** (for fully-established connections). These queues are _part of the socket_, not tied to any single process. A listening socket can be shared (for example, across forked processes) because everything is a file descriptor in Linux.

1. **Client sends SYN:** The client sends a SYN packet to start a TCP connection. The server’s kernel receives this and puts the incoming connection request into the _SYN queue_. It simultaneously sends back a SYN+ACK.
2. **Server replies with SYN+ACK:** The client receives the SYN+ACK and replies with an ACK. When the server’s kernel gets this final ACK, the connection is now fully established.
3. **Move to accept queue:** Upon receiving the ACK, the kernel **moves the connection from the SYN queue into the accept queue**. Only now is the connection truly established at the kernel level.
4. **Application accepts:** When a server process calls `accept()` on the listening socket, the kernel removes one connection from the **accept queue** and returns a new connected socket to the application. That connection is popped off the queue and handed to the process.

- **Backlog parameter:** The number given to `listen(sockfd, backlog)` controls the size of the accept queue. Current Linux versions use the two-queue model, where _backlog specifies the queue length for completely established sockets waiting to be accepted_. In other words, `backlog` limits how many connections can be in the accept queue. The SYN queue size is controlled separately by `/proc/sys/net/ipv4/tcp_max_syn_backlog`.

![TCP handshake and queues](https://upload.wikimedia.org/wikipedia/commons/a/a2/Tcp_state_diagram_fixed.svg)  
_Figure: TCP state diagram showing LISTEN, SYN-RECEIVED, and ESTABLISHED states. The kernel moves a connection from the SYN queue to the accept queue once the handshake completes._

## Key Characteristics

- **Shared socket:** A listening socket is a kernel object that can be shared. If the main server process calls `fork()`, each child gets a copy of the listening socket file descriptor. All children can then use `accept()` on the same socket.
- **Single queue structure:** All incoming connections for that port go into _the same_ listening socket object. There is _one_ SYN queue and _one_ accept queue per socket, no matter how many processes share it.
- **Locking and contention:** Because the queues are shared, the kernel uses locks to manage them. In high-load scenarios many processes will contend to pop from the accept queue. This can cause _mutex contention_. Newer options like `SO_REUSEPORT` allow each process to have its own queue to avoid this.
- **Load distribution:** By default, Linux wakes up one waiting process at a time in FIFO order. For blocking accept calls, connections are distributed round-robin.
- **Fairness/strategy:** Each process waiting on `accept()` is added to a queue and served in order. This keeps things fair between workers.

## Advantages & Disadvantages

- **Advantages:**

  - Multiple acceptors can use multiple CPU cores for higher throughput.
  - If one process is slow, others continue handling new connections.
  - Robustness: if one worker crashes, others still accept.

- **Disadvantages:**
  - Shared queue locking causes contention at high loads.
  - Potential “thundering herd” problem if many processes wake up at once.
  - A single shared queue can become a bottleneck at very high scale.

## Practical Implementations / Examples

- **Accept loop:**
  ```c
  int sd = socket(...);
  bind(sd, ...);
  listen(sd, 100);
  while (1) {
      int client = accept(sd, NULL, NULL);
      // handle client...
  }
  ```

* **Forking workers:** A common pattern is to `fork()` a pool of worker processes *after* calling `listen()`. Each child inherits the listening socket. All children then loop on `accept(sd, ...)`.

* **Using SO\_REUSEPORT:** In newer setups, each worker can set `setsockopt(SO_REUSEPORT)` and then `bind()` its own socket to the same port. The kernel then load-balances connections across separate accept queues (one per worker).

## Conclusion

In summary, the Linux kernel handles new TCP connections in two stages: first the **SYN queue** during the handshake, then the **accept queue** once the handshake completes. Each listening socket has exactly one SYN queue and one accept queue. Multiple processes can share that socket – the kernel simply coordinates them via the shared queues.

*Reflecting on this, I realize how much the kernel does to manage fairness and concurrency. This helps me better understand how backend servers handle high connection loads efficiently.*


