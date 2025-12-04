---
layout: article
key: backend-communication-notes-week1-recap
title: "Backend Communication Fundamentals: Week 1 Recap"
modify_date: 2025-04-01
date: 2025-04-01
excerpt: "A recap of the first week of backend communication fundamentals, covering Pub/Sub, Stateful vs Stateless Systems, Multiplexing, and the Sidecar Pattern."
author: "Ahmed Nasser"
categories: ["Backend Communication"]
tags:
  [
    "Pub/Sub",
    "Stateful vs Stateless",
    "Multiplexing",
    "Sidecar Pattern",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
draft: false
mathjax: false
mathjax_autoNumber: false
---

> **Note:** This is an older version of this post. For the most up-to-date and complete information, please see the newer version: [Backend Communication Fundamentals: Week 1 Recap](/2025/04/03/backend-communication-week1.html).

## Week 1 Recap: Backend Communication Fundamentals

Today, we covered important topics in backend communication. This post summarizes key concepts in an easy-to-follow way for future reference.

## 1. Publish-Subscribe (Pub/Sub) Pattern

### Key Terms

- **Publisher**: Sends messages to a broker (e.g., Kafka, RabbitMQ).
- **Subscriber**: Listens for messages from the broker.
- **Broker/Queue**: Middleman that handles message delivery.
- **Topics**: Categories for messages (e.g., "raw videos").
- **At-Least-Once Delivery**: Ensures messages are delivered at least once.
- **Long Polling**: Clients periodically check for new messages.

### How It Works

Imagine YouTube’s video processing:

1. **Uploader Service** ➝ Publishes raw video.
2. **Compression Service** ➝ Subscribes & compresses video.
3. **Format Service** ➝ Converts video to multiple resolutions.
4. **Notification Service** ➝ Sends alerts to users.

### Pros

- Services work independently (decoupling).
- Scales well with demand.
- Handles failures better (fault tolerance).

### Cons

- Duplicate messages possible.
- More network traffic.
- Broker failure affects the system.

---

## 2. Stateful vs Stateless Systems

### Key Terms

- **Stateful**: Stores session info (e.g., shopping cart saved on a server).
- **Stateless**: No stored session; each request is independent (e.g., APIs using JWT).
- **Sticky Sessions**: Users stay on the same server.
- **JWT (JSON Web Token)**: Stores user data in a token.

### How They Work

- **Stateful Example**: A web app that stores user sessions on the server.
  - Problem: If the server restarts, sessions are lost.
- **Stateless Example**: API using JWT, where the token is sent with each request.
  - Advantage: Works across multiple servers.

### Pros & Cons

| Feature     | Stateful                     | Stateless         |
| ----------- | ---------------------------- | ----------------- |
| Scaling     | Harder                       | Easier            |
| Performance | Faster                       | Can be slower     |
| Reliability | Server crash = lost sessions | Survives restarts |

---

## 3. Multiplexing vs Demultiplexing

### Key Terms

- **Multiplexing**: Combining multiple data streams in one connection (e.g., HTTP/2).
- **Demultiplexing**: Splitting one connection into multiple streams.
- **Connection Pooling**: Reusing open connections.

### Real-Life Examples

- **Web Browsers**:
  - HTTP/1.1 opens 6 connections per site.
  - HTTP/2 multiplexes multiple requests over a single connection (faster!).
- **Databases**:
  - PostgreSQL v14 supports query pipelining, reducing delays.

### Pros & Cons

- **Multiplexing**: Uses fewer connections, reduces network load, but requires CPU power.
- **Demultiplexing**: Avoids blocking, but needs good resource management.

---

## 4. Sidecar Pattern

### Key Terms

- **Sidecar Proxy**: A helper process managing networking (e.g., Envoy, Linkerd).
- **Service Mesh**: A network of sidecars managing traffic (e.g., Istio).
- **Layer 7 Proxy**: Understands application-level protocols (e.g., HTTP).
- **Layer 4 Proxy**: Works at the transport level (e.g., TCP, UDP).
- **Polyglot Architecture**: Allows different languages to communicate via sidecars.

### Real-Life Example

- **Twitter’s Evolution**:
  - Started with one big application.
  - Moved to microservices with a service mesh.
  - Sidecars helped different services communicate efficiently.

### Pros

- Upgrades without changing apps (e.g., adding HTTP/3 support).
- Better security and monitoring.

### Cons

- Extra latency due to additional hops.
- More complexity in setup and debugging.

---

## 🔗 Key Takeaways Across All Lectures

1. **Trade-Offs Exist**:
   - Pub/Sub improves scalability but increases network load.
   - Stateful systems are faster but harder to scale.
   - Sidecars simplify communication but add complexity.
2. **Protocols Keep Evolving**:
   - HTTP/2 improves speed but still has head-of-line blocking.
   - Service meshes help microservices but introduce overhead.
3. **Scalability Needs Thoughtful Design**:
   - YouTube optimizes workloads with Pub/Sub.
   - Twitter adapted its stack over time for efficiency.

This concludes Day 4! Next, I'll compile everything into a weekly recap. 🚀
