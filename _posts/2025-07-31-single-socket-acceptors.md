---
layout: article
title: "Multiple Threads Accepting on One Socket"
date: 2025-07-31
modify_date: 2025-07-31
excerpt: "Lecture notes on using multiple accepter threads on a single listening socket, discussing how the OS handles accept calls and the trade-offs involved."
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
key: single-socket-acceptors
---

## Introduction

Could we handle many connections by having several threads all wait on the same listening socket? This pattern was discussed in the lecture "Multiple Accepter Threads on a Single Socket". Instead of using separate sockets, one process creates a listening socket and spawns many threads. Each thread calls `accept()` on this socket in a loop. The big question is: how does the OS manage that, and is it efficient? The main insight is that it can work, but it can also waste effort if not done carefully.

## Core Concepts/Overview

In this pattern, _one_ listening socket is shared by many threads within the same process. Each thread blocks on `accept()`. When a client connects, the kernel wakes up one or possibly more threads to handle it. On modern Linux (>=3.9), the kernel will typically wake _one_ thread per connection (avoiding the "thundering herd" problem). The chosen thread then completes the `accept()` and the others continue waiting. Thus, threads take turns accepting connections from the same socket.

## Key Characteristics

- **Single Socket, Many Threads:** One `socket()` + `bind()` + `listen()`, then multiple threads share it.
- **Thread-Level Parallelism:** Each thread can accept a new connection, so multiple connections can be accepted in parallel on different CPU cores.
- **OS Wake-Up:** The kernel usually wakes one thread for each new connection (on newer OS versions). All threads were waiting, but only one does the accept.
- **Possible Race:** If the OS didn’t handle it well, many threads could wake and compete (older kernels had that issue).
- **Environment:** This works in many languages and systems (no special socket options needed, unlike the sharding case).

## Advantages & Disadvantages

- **Advantages:**

  - _No Special Options Needed:_ No `SO_REUSEPORT` or multiple sockets; simple to code in many environments.
  - _Utilize Multiple Cores:_ More threads can accept on different cores if incoming load is high.
  - _Simplicity:_ Easier initial setup if you’re already in a multithreaded server.

- **Disadvantages:**

  - _Thundering Herd:_ In older systems or without fixes, all threads might wake for one new connection, and only one wins. This wastes CPU.
  - _Load Imbalance:_ If one thread is slow (or busy), others might idle while connections queue up.
  - _Single Process Limit:_ Can’t scale across processes; only threads share the socket.
  - _Marginal Benefit:_ Often similar to having one accept thread and a pool of worker threads. The gain is usually smaller than the sharding approach.

## Practical Implementations/Examples

A simple code sketch:

```pseudo
listen_fd = socket(...);
bind(listen_fd, port);
listen(listen_fd);

for i in 1..NUM_THREADS:
    thread_start {
        while (true) {
            client_fd = accept(listen_fd);
            // handle the new connection (e.g., process request)
            close(client_fd);
        }
    }
```

Each thread runs the same loop, calling `accept(listen_fd)`. On a modern Linux, the OS ensures only one thread returns from `accept()` for each connection. On some other systems, or if the socket is non-blocking with poll/select, multiple threads could race and get `EAGAIN`. Proper handling (checking errors, sleeping) is needed there. Also, unlike the sharding case, we **don’t** set `SO_REUSEPORT` here, since we only have one socket.

## Conclusion

The multiple accepter threads pattern is a straightforward way to use threads for parallel accepting. My takeaway is that it can help with multi-core accept, but it has drawbacks. If every thread awakens on each connection, it’s inefficient. I learned that modern kernels reduce this problem, but still, adding more threads on one socket has limited benefit. Personally, I would probably prefer socket sharding (if available) or a single acceptor with worker threads for handling clients. Still, it’s good to know how the OS can let threads share a socket, and that we should watch out for the thundering herd issue.
