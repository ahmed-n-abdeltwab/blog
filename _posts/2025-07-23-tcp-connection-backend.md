---
layout: article
title: "How the Backend Accepts TCP Connections"
date: 2025-07-23
modify_date: 2025-07-23
excerpt: "An explanation of how backend applications accept TCP connections, from the network interface to kernel queues to the process layer."
tags:
  [
    "Backend",
    "Networking",
    "Linux",
    "LectureNotes",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
key: tcp-connection-backend
---

## Introduction

Ever wonder what really happens when your app starts listening on a port? When you call `listen()` on a socket (say, port 80), your server isn’t instantly talking to clients yet. Behind the scenes, the **OS kernel** takes over: a network card (NIC) picks up the incoming packets, the kernel completes the TCP 3-way handshake, and only then hands a new socket to your application. The key takeaway from the lecture is that **all the TCP handshake and queuing lives in kernel space** – your application (in user space) simply calls `accept()` to grab a fully-established connection. In other words, the NIC and kernel do the “heavy lifting” of receiving packets and building the connection, and only a finished socket ends up with your code.

&#x20;_Figure: The classic TCP 3-way handshake between client and server (SYN, SYN+ACK, ACK)_. This handshake is handled in the kernel; once it succeeds, the connection enters the server’s accept queue, waiting for the app to `accept()` it.

## Core Concepts / Overview

TCP connections start with the **three-way handshake**. First, a client sends a SYN packet to the server’s IP and port. The server (in the kernel) responds with SYN+ACK, and finally the client sends an ACK. Once that last ACK arrives, both sides consider the connection established. During steps 1–3, the server’s kernel maintains **two queues**:

- A **SYN queue** (also called the incomplete or connection-request queue) holds connections that have sent SYN but not yet completed the handshake.
- An **accept queue** (a.k.a. backlog queue) holds fully-acknowledged connections that the kernel has established and are waiting for the application to accept them.

When the server’s kernel gets the final ACK in step 3, it removes that connection request from the SYN queue and creates a new socket in the **accept queue**. In Linux, the `listen()` call’s backlog parameter sets the _maximum length of this accept queue_. (Separate from this, a sysctl like `/proc/sys/net/ipv4/tcp_max_syn_backlog` controls how many half-open connections the SYN queue can hold.)

Sockets themselves are endpoints identified by (IP address, port, interface). When you bind and listen, you specify an IP/interface. For example, binding to `0.0.0.0:80` means “all interfaces on port 80”. A process listening on `0.0.0.0` is reachable via _any_ network interface, whereas `127.0.0.1` means “only local loopback”. (In the lecture, we learned that many servers accidentally listen on all interfaces by default, which can expose them publicly.)

Once a connection completes the handshake in the kernel, your server application calls `accept()`. That removes a ready socket from the accept queue and returns a new **file descriptor** for it. From then on, the process uses that FD to `read()`/`write()` data on the connection. (The original listening socket FD remains open for more accepts, and its queue shrinks by one.)

## Key Characteristics

- **Two Queues (SYN vs. Accept):** The kernel keeps incomplete connections in the SYN queue and moves them to the accept queue after the final ACK. Both queues have limits: if the accept queue is full, the kernel will start dropping or resetting incoming connections. By default, Linux uses the `backlog` value for the accept queue and a sysctl for the SYN queue.
- **Interface Binding:** Listening sockets bind to an IP/interface. Binding to `0.0.0.0` (IPv4) or `::` (IPv6) means “all interfaces”. A socket bound to a specific IP will only accept traffic to that IP. The lecture noted that one machine can have many NICs (e.g. loopback, LAN, public) and you choose which to bind.
- **File Descriptors:** Each listening socket (in the kernel) corresponds to an FD in the process. Each accepted connection produces a _new_ FD. The `accept()` syscall “extracts the first connection request on the queue... creates a new connected socket, and returns a new file descriptor referring to that socket”. In code, for example:

  ```c
  int listenfd = socket(AF_INET, SOCK_STREAM, 0);
  bind(listenfd, (struct sockaddr*)&addr, sizeof(addr));
  listen(listenfd, 5);  // backlog = 5
  int connfd = accept(listenfd, NULL, NULL);  // blocks until a connection is ready
  ```

- **NIC and OS Role:** The **Network Interface Controller (NIC)** handles raw frames and uses DMA to put packets in memory. Modern NICs may have multiple hardware queues. The OS kernel dequeues from NIC queues and runs protocol stacks. In Linux, most TCP processing (IP header parsing, ACKing SYN, managing the socket structures) happens in kernel space. User-space code never touches raw packets; it only sees byte streams via sockets.
- **Kernel vs. User Space:** The separation is clear: the **kernel space** does all TCP/IP work (layer 4 and below), queuing, buffering, etc. The **user space** code simply calls `listen()`, then later `accept()` and `recv()/send()` on file descriptors. If no connection is ready, `accept()` will block (unless non-blocking) until the kernel has moved a socket into the accept queue. The heavy lifting – including the 3-way handshake and moving sockets between queues – stays in the kernel.

## Advantages & Disadvantages

- **Performance:** Offloading connection setup to the kernel is efficient. The kernel can handle thousands of tiny packets (SYN/ACK) with minimal copying. NIC offloads (e.g. checksum, offload) speed this up. Also, a well-tuned backlog allows high throughput. However, if your app is slow to `accept()`, the accept queue can fill up and new clients will be dropped. You might then see “TCP listen queue overflow” messages.
- **Security/Exposure:** By default listening on all interfaces (`0.0.0.0`) makes the service public. This is handy for clients, but dangerous if unintended. The lecture warned that, for example, databases should not blindly listen on all IPs. Binding explicitly to `127.0.0.1` or a private IP can avoid accidental exposure. Also, the SYN queue is vulnerable to SYN-flood attacks. Linux mitigates this with **SYN cookies**: if the SYN queue overflows, the kernel can generate stateless SYN-ACKs and validate the final ACK using a cryptographic check, avoiding resource exhaustion.
- **Backlog Tuning:** The `backlog` value is important. A too-small backlog means legitimate connections get dropped (or delayed) when under load. A too-large backlog wastes memory. Linux caps the backlog by `somaxconn` (often 128 by default). For production servers under heavy load, tuning `/proc/sys/net/ipv4/tcp_max_syn_backlog` and `somaxconn` can improve resilience. But careless tuning can cause unexpected behavior, so only adjust if you understand your workload.

## Practical Examples

A common way to inspect queues is with `ss` (socket statistics). For example:

```bash
$ ss -ltn
State   Recv-Q Send-Q Local Address:Port Peer Address:Port
LISTEN  0      5       0.0.0.0:80       0.0.0.0:*
```

Here, **Recv-Q** (0) is the current accept queue length (0 connections waiting to be `accept()`ed), and **Send-Q** (5) shows the backlog size (in this example, we called `listen(..., 5)`). As [Aditya Barik’s blog notes](#), in the LISTEN state `Recv-Q` is the number of fully-established connections queued, and `Send-Q` is the maximum queue length.

Below is a simple C code sketch for a listening server:

```c
int sock = socket(AF_INET, SOCK_STREAM, 0);
struct sockaddr_in addr = {0};
addr.sin_family = AF_INET;
addr.sin_addr.s_addr = htonl(INADDR_ANY);  // listen on all interfaces
addr.sin_port = htons(8080);
bind(sock, (struct sockaddr*)&addr, sizeof(addr));
listen(sock, 10);  // backlog=10

while (1) {
    int conn = accept(sock, NULL, NULL);
    // conn is a new FD for this connection; kernel dequeued it from accept queue:contentReference[oaicite:32]{index=32}.
    // handle client on 'conn' (e.g., read/write)...
    close(conn);
}
```

If more than 10 connections are pending (not yet accepted), further incoming SYN+ACKs will be dropped or reset until there’s room in the queue. One can also visualize the flow: client’s SYN ⇒ **NIC** ⇒ **SYN queue** ⇒ (on ACK) ⇒ **Accept queue** ⇒ `accept()` in user process.

## Conclusion

In summary, accepting TCP connections is a team effort between the network hardware, the OS kernel, and your application. The NIC and kernel handle the packets and state transitions of the 3-way handshake, using a dedicated SYN-queue and accept-queue to buffer connections. The user-space backend just binds to an address/port and calls `accept()` to retrieve each fully-established socket. Key concepts include setting the right _backlog_, binding to the correct interface, and understanding that any performance or security issues (like queue overflows or exposures) happen mostly in the kernel.

Learning these internals (as covered in the lecture) really deepened my understanding of socket behavior. Now I appreciate that many things – from TCP handshake timing to DDoS protection (SYN cookies) – are dealt with before my code even runs. The next time I write network server code, I’ll remember: tune your backlog wisely, bind to the right IP, and let the kernel do its magic under the hood.
