---
layout: article
title: "Running Out of TCP Ports"
date: 2025-09-04
modify_date: 2025-09-04
excerpt: "What happens when a web server opens too many connections? A real bug story and a deep dive into TCP ephemeral port exhaustion."
tags:
  [
    "Networking",
    "TCP",
    "EphemeralPorts",
    "Troubleshooting",
    "LectureNotes",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
key: running-out-of-tcp-ports
---

## Introduction

Have you ever seen a web server suddenly stop responding, with no obvious cause? I recently listened to a podcast by Hussein Nasser about a real debugging story. In this story, a web server kept opening new connections to a backend message queue for every incoming request. It worked fine at first, but eventually the server **ran out of ephemeral ports** and became unresponsive.

This note explains that scenario in simple terms. I’ll answer a question like: _Why do ephemeral TCP ports matter?_ We will see what TCP connections look like (their “4-tuple”), why too many outbound connections can exhaust ports, and how the bug was fixed. Along the way, we’ll look at how tools like **netstat** helped find the problem, and why reusing connections fixed it.

## Core Concepts

**Ephemeral ports** are temporary port numbers that the operating system assigns to outgoing connections. When a program connects to a server (for example, an HTTP request), the server has a fixed IP address and port (like port 80 or 443). The client (our web server) also has a fixed IP address. The OS chooses an unused port for the client side from a local range called the _ephemeral port range_. On many Linux systems, this range is about `32768–60999`.

A TCP connection is uniquely identified by four values (called the _4-tuple_):

**(client IP, client port, server IP, server port)**.

Since the server’s IP and port are fixed for each backend service, and the client’s IP is usually fixed on its machine, the **only thing that changes is the source (client) port**. For each new connection to that same server, the OS picks a new ephemeral port.

Example:

```bash
192.168.1.10:40001 -> 10.0.0.5:5672
192.168.1.10:40002 -> 10.0.0.5:5672
```

If those ports go from `32768` to `60999`, that’s about 28k possible ports. In the actual bug story, the server created around 20–25k connections and hit the limit.

## Key Characteristics

- **Limited range of ports:** Only ~25k outbound connections possible when all addresses are fixed.
- **Netstat to troubleshoot:** Running `netstat -an` revealed **10k–20k established connections** from the web server to the broker. Normally, only one or a few should exist (since the broker supports multiplexing).
- **Idle connections:** Each request opened a new connection that stayed idle and alive because of a custom “ping-pong” heartbeat at the application layer.
- **What happens when exhausted:** Once all ephemeral ports were used, new requests could not connect, and the web server froze. Other applications on the same machine also broke because they couldn’t open outbound connections.
- **Client vs. server side difference:** Many clients connecting to one server works fine because each has a unique source IP. But one client making many connections to the same backend quickly runs out of available ports.

## Advantages & Disadvantages

**New connection for each request:**

- Advantage: Simple code, each request is isolated.
- Disadvantage: Eats ephemeral ports very quickly, inefficient, server can freeze.

**Reusable connections:**

- Advantage: Saves resources, one connection can handle many requests, more scalable.
- Disadvantage: Slightly more complex to manage connection pooling and failures.

## Practical Implementations

- **Netstat check:**

  ```bash
  netstat -an | grep <broker_port>
  ```

Showed tens of thousands of connections, which was abnormal.

* **Bug in code:** Every request always created a new connection to the broker. The fix was to **reuse an existing connection** or use a connection pool.

* **Port range tuning:** On Linux, check ephemeral port range with:

  ```bash
  sysctl net.ipv4.ip_local_port_range
  ```

  You can expand it, but the real fix is efficient connection reuse.

* **Error symptoms:** When ephemeral ports run out, you may see errors like *“Cannot assign requested address”* when calling `connect()`.

* **Keepalive considerations:** Reusing connections often requires a keep-alive strategy so sockets don’t silently drop.

* **Further reading:** [Cloudflare blog on ephemeral ports](https://blog.cloudflare.com/how-to-stop-running-out-of-ephemeral-ports/)

## Conclusion

In short, a TCP connection needs **(src IP, src port, dest IP, dest port)**. When a web server kept opening fresh outbound connections to the same backend, it used up all ephemeral source ports. Around 20k idle sockets piled up, and the server froze.

The fix was simple but powerful: **reuse connections**. After correcting the logic, the server went back to handling requests smoothly with just one persistent connection.

**Takeaway:** Always think about connection reuse. A tiny code decision—like opening a new socket per request—can bring down an entire system.

*For me, this was a reminder that small design details matter. From now on, I’ll always ask: “Could I reuse this connection?” before opening a new one.*


