---
layout: article
title: "Backend Communication Fundamentals: Day 1 Notes"
date: 2025-03-29
modify_date: 2025-03-29
excerpt: "Understanding the foundational concepts of backend communication patterns, protocols, and request-response mechanisms."
tags: [
    "Backend",
    "Networking",
    "Protocols",
    "API",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: false
mathjax_autoNumber: false
key: backend-communication-notes
---

## **Backend Communication Fundamentals**

## **Section 1: Introduction**

### **Key Vocabulary**

- Multiplexing, Demultiplexing, HTTP, TCP, Multipath TCP, HTTP/2
- Browser Demultiplexer, STB, Protocol (Rules, Properties), UDP
- OSI Model, gRPC, Reverse Proxy, UDP Datagrams
- Handshake, Flow Control, Congestion Control, Reliable Communication
- HTTP/3, WebRTC, HTTPS, Zero Round Trip, Kernel
- Single Listener, Multiple Listeners, Multiple Threads, Single Process, Multiple Processes
- Latency, Performance, Proxies, Load Balancers, Layer 7, Reverse Proxy

### **Key Notes**

#### **First Principles of Backend Communication**

- **Request-Response Model**: The client sends a request, the server processes it, and returns a response.
- **Push-Pull Model**: The server pushes updates or the client pulls data as needed.
- **Long Polling Model**: The client repeatedly requests updates at intervals.
- **Publish-Subscribe Model**: Clients subscribe to topics and receive notifications when new data is available.

---

## **Section 2: Backend Communication Design Patterns**

### **Key Vocabulary**

- Protocol Buffer, RPC (Remote Procedure Call), REST, SOAP, GraphQL

### **Key Notes**

#### **Request-Response Model**

  _How it works:_

1. The client sends a request.
2. The server parses the request.
3. The server processes the request.
4. The server sends a response.
5. The client parses and consumes the response.

#### **Request Parsing & Processing**

- **Parsing the request**: Identifying the start and end of a message.
- **Processing the request**: Handling various data formats (JSON, form data, HTML, etc.).

#### **Where is it used?**

- **Web protocols**: HTTP, DNS, SSH
- **RPC communication**
- **SQL & Database Protocols**
- **API architectures**: REST, SOAP, GraphQL

#### **Anatomy of a Request-Response**

- Each request is structured according to an agreed-upon format between the client and server.
- Defined by **protocol & message structure**.
- Example HTTP request:

  ```
  GET /resource HTTP/1.1
  Host: example.com
  Content-Type: application/json
  ```

#### **Uploading an Image Using Request-Response**

**Two Approaches:**

1. **Single Large Request**: Upload the entire image in one request.
2. **Chunked Upload**: Split the image into chunks and send them separately.
   - ✅ Allows pause & resume functionality.
   - ❌ Adds complexity compared to a single request.

#### **Limitations of Request-Response**

- **Not efficient for:**
  - Real-time applications (e.g., chat, notifications)
  - Long-running requests
  - Handling client disconnections

#### **Understanding cURL Response Chunking**

- When using `curl -v --trace out.txt`, responses arrive in chunks due to TCP segmentation.
- Typical chunk size: **1388 bytes** (based on TCP Maximum Segment Size ≈ 1460 bytes).
- **Why 1388 bytes?**
  - Standard TCP Maximum Segment Size (MSS) is **1460 bytes**.
  - Some bytes are reserved for TCP headers, leaving **1388 bytes for data**.
- **Who controls this?**
  - The OS’s TCP stack negotiates MSS during the handshake.
  - The server may adjust chunk sizes based on network conditions.

  _Key takeaway:_ TCP segmentation determines chunk sizes, not cURL or the server directly.
