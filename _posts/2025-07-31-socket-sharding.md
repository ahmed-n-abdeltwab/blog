---
layout: article
title: "Socket Sharding: Multiple Listeners on the Same Port"
date: 2025-07-31
modify_date: 2025-07-31
excerpt: "Lecture notes on using socket sharding (SO_REUSEPORT) for multiple listeners, acceptors, and readers on one port to improve scalability."
tags:
  [
    "Networking",
    "Programming",
    "LectureNotes",
    "Sockets",
    "Concurrency",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
key: socket-sharding
---

## Introduction

What if your web server could handle even more traffic by listening on the same port multiple times? In this lecture I learned about **socket sharding**. The idea is to run several listeners/acceptors on one port to spread out the work. For example, high-performance proxies like NGINX or Envoy do this by default. The main insight is that the OS can help distribute incoming connections among multiple workers if we use a special socket option.

## Core Concepts/Overview

Socket sharding uses the `SO_REUSEPORT` option. Normally, only one process can bind to a port at a time. With `SO_REUSEPORT`, **multiple processes or threads can each bind to the same address and port**. The kernel creates separate accept queues for each listener. When new connections arrive, the OS does a form of load balancing (often round-robin or hash-based) and puts each connection into one of the queues. Each process/thread then calls `accept()` on its own socket. All of them become true listeners and acceptors, but they don’t step on each other because each has its own queue.

## Key Characteristics

- **SO_REUSEPORT:** Must set this socket option before binding. It enables sharing the same port.
- **Multiple Queues:** The OS maintains a separate accept queue per listener, avoiding a single lock or bottleneck.
- **Load Distribution:** The kernel roughly balances incoming connections among the listeners, often in a round-robin way.
- **Unique Socket IDs:** Each listening socket is distinct (gets a unique ID) even though they share the same port number.
- **Common in Proxies:** Widely used in web servers and proxies for performance. (For example, Envoy enables this on startup.)
- **Language Support:** Generally used in low-level languages (C, Rust, etc.). Some high-level environments (like Node) may not easily expose it.

## Advantages & Disadvantages

- **Advantages:**

  - _Increased Throughput:_ Many acceptors can run in parallel without fighting for one queue, using multi-core better.
  - _Reduced Contention:_ No single thread is a bottleneck for accepting new connections.
  - _OS-Level Balancing:_ The kernel handles distribution, which can be efficient and simple to use.

- **Disadvantages:**

  - _Limited Support:_ Not available or easy in all frameworks or languages.
  - _Load Imbalance:_ If connections have very different workloads, one listener might get heavier load by chance.
  - _Complexity:_ Setup is more complex (must remember the reuse port option and, in some OS, share a secret key among processes to prevent hijacking).
  - _Security Considerations:_ The OS has mechanisms (like a special key) to prevent an unrelated process from sneaking in. This adds subtlety to implementation.

## Practical Implementations/Examples

In practice, you would do something like this in C (as a rough example):

```c
int sockfd = socket(AF_INET, SOCK_STREAM, 0);
int opt = 1;
setsockopt(sockfd, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt));
bind(sockfd, (struct sockaddr*)&addr, sizeof(addr));
listen(sockfd, 128);
```

Then you might `fork()` or create threads, and each one uses the same code to `accept()` on `sockfd`. Because of `SO_REUSEPORT`, the OS gave each thread/process its own queue. In Node.js you can’t normally do this, but in environments like native C or Rust servers you can. In platforms like Kubernetes, each pod can also independently use this option to scale out.

## Conclusion

Socket sharding with `SO_REUSEPORT` lets us scale horizontally within one machine: multiple workers can listen on the same port and handle connections in parallel. The OS helps by load-balancing new sockets among them. From a personal view, this is a cool trick. It means even if I'm using multiple threads or processes, I don’t have to do manual socket distribution. My takeaway is: if I ever need to build a high-performance server, I should check if my environment supports this option. It can greatly improve concurrency for busy services.
