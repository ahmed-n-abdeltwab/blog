---
layout: article
title: "Backend Communication Fundamentals: Day 1 Notes"
date: 2025-03-29
modify_date: 2025-03-29
excerpt: "Understanding the foundational concepts of backend communication patterns, protocols, and request-response mechanisms."
tags: ["Backend", "Networking", "Protocols", "API"]
mathjax: true
mathjax_autoNumber: true
key: backend-communication-notes
---

# **Backend Communication Fundamentals**
### *Day 1: Introduction & Request-Response Model*

## **🔹 Section 1: Introduction to Backend Communication**
### **📌 Key Vocabulary**
- Multiplexing / Demultiplexing
- HTTP, TCP, UDP, Multipath TCP, HTTP/2, HTTP/3
- Browser Demultiplexer
- STB (Set-Top Box)
- Protocol (Rules & Properties)
- OSI Model, OCI Model
- gRPC, Reverse Proxy
- UDP Datagrams
- Handshake, Flow Control, Congestion Control
- Reliable Communication
- WebRTC, HTTPS, Zero Round Trip (0-RTT)
- Kernel, Single Listener, Multiple Listeners
- Single Process, Multi-process, Multi-threading
- Latency, Performance
- Proxies, Load Balancers, Layer 7, Reverse Proxy

### **📒 Key Notes**
#### **1️⃣ First Principles of Communication Patterns**
- **Request-Response Model**: Client requests, server processes and responds.
- **Push-Pull Model**: Data is pushed or pulled based on availability.
- **Long Polling Model**: Client maintains connection until data is available.
- **Publish-Subscribe Model**: Clients subscribe to events; updates are broadcasted.

---

## **🔹 Section 2: Backend Communication Design Patterns**
### **📌 Key Vocabulary**
- Protocol Buffer
- RPC (Remote Procedure Call)
- REST, SOAP, GraphQL

### **📒 Key Notes**
#### **1️⃣ Request-Response Model**
📌 *How it works:*
1. Client sends a request.
2. Server parses the request.
3. Server processes the request.
4. Server sends a response.
5. Client parses and consumes the response.

#### **2️⃣ Request Parsing & Processing**
- **Parsing the request**: Identifying start and end.
- **Processing the request**: Handling data formats (JSON, Form, HTML, etc.).

#### **3️⃣ Where is it used?**
- **Web protocols**: HTTP, DNS, SSH
- **RPC communication**
- **SQL & Database Protocols**
- **API structures**: REST, SOAP, GraphQL

#### **4️⃣ Anatomy of a Request-Response**
- A request is structured based on client-server agreements.
- Defined by **protocol & message format**.
- HTTP request example:
  ```
  GET /resource HTTP/1.1
  Host: example.com
  Content-Type: application/json
  ```

#### **5️⃣ Uploading an Image Using Request-Response**
**Two Approaches:**
1. **Single Large Request**: Upload the entire image in one request.
2. **Chunked Upload**: Split image into chunks and send multiple requests.
   - ✅ Can pause & resume.
   - ❌ Not as simple as a single request.

#### **6️⃣ When Request-Response Fails**
- **Doesn’t work well for:**
  - Notification services
  - Chat applications
  - Long-running requests
  - Client disconnections

#### **7️⃣ Understanding cURL Response Chunking**
- When using `curl -v --trace out.txt`, the response body arrives in chunks.
- Default chunk size: **1388 bytes**, but varies (e.g., last chunk = 820 bytes).
- **Why 1388 bytes?**
  - Standard TCP Maximum Segment Size (MSS) ≈ **1460 bytes**.
  - Some bytes used for TCP headers/options, leaving **1388 bytes for data**.
- **Who controls this?**
  - OS TCP stack negotiates MSS during the handshake.
  - Server may also influence chunk sizes based on network conditions.

📌 *Key takeaway:* Chunk sizes in cURL are determined by TCP segmentation, not curl or the server directly.

---
### **🔮 Next Steps**
- Explore **Synchronous vs. Asynchronous Workloads**.
- Compare **alternative communication patterns** like WebSockets & gRPC.
- Dive into **REST vs. GraphQL vs. RPC** comparison.
- Implement **real-world examples** of different backend communication methods.

📢 *Stay tuned for more insights as I continue this course!* 🚀

