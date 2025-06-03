---
layout: article
title: "Backend Communication Fundamentals: Protocols (Day 1, Section 3)"
date: 2025-04-09
modify_date: 2025-04-09
excerpt: "An in-depth look at backend communication protocols, including their properties, data formats, transfer modes, addressing, reliability, and error handling. This session explores classic and modern protocols such as TCP, UDP, HTTP, gRPC, and Homa."
tags:
  [
    "BackendEngineering",
    "Networking",
    "APIs",
    "Protocols",
    "TCP",
    "UDP",
    "Microservices",
    "SystemDesign",
    "Performance",
    "Scalability",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: true
mathjax_autoNumber: true
key: backend-communication-protocols-day1
---

## **Backend Communication Design Patterns: Protocols (Day 1, Section 3)**

## **1. Introduction to Protocols**

- A **communication protocol** is a set of rules that allows two parties to communicate.
- If both parties follow the same protocol, they can exchange information effectively.
- Protocols are designed with specific **properties** based on their purpose and the problem they solve.

## **2. Why Are Protocols Important?**

- Every protocol is created to **address a specific problem**.
- Example: **TCP** was designed in the **1960s** for low-bandwidth networks.
  - Modern **data centers** push TCP to its limits, leading to the creation of newer protocols like **Homa** (2022).
- Different protocols are used in various contexts:
  - **Classic Protocols**: DHCP, UDP, HTTP, gRPC, FTP, SMTP, etc.
  - **Emerging Protocols**: Homa (not yet an RFC, still a research paper).

---

## **3. Key Properties of Communication Protocols**

### **A. Data Format**

Defines how data is structured for transmission. Two main types:

1. **Text-Based Protocols** (Human-readable)
   - Examples: **Plaintext, JSON, XML, HTTP**
   - Can be read directly from the wire (unless encrypted).
2. **Binary Protocols** (Machine-optimized)
   - Examples: **Protocol Buffers, Redis Serialization, gRPC, HTTP/2**
   - More efficient but not human-readable.

### **B. Transfer Mode**

Determines how data is sent over the network. Two main types:

1. **Message-Based Protocols** (Discrete messages)
   - Each message has a clear start and end.
   - Examples: **HTTP, UDP** (messages are packed into IP packets).
2. **Stream-Based Protocols** (Continuous data flow)
   - No fixed start or end, just a stream of bytes.
   - Examples: **TCP, RTSP** (used in video streaming).
   - Challenge: Clients must parse TCP streams to find message boundaries.

### **C. Addressing System**

How a protocol identifies **source** and **destination**.

- **Domain Name System (DNS)**: Converts domain names to IP addresses.
- **IP Addressing (Layer 3)**: Identifies devices over the internet.
- **MAC Address (Layer 2)**: Used within local networks.
- **ARP (Address Resolution Protocol)**: Converts IP addresses to MAC addresses.

### **D. Directionality**

Defines data flow:

1. **Unidirectional**: Data flows in one direction.
2. **Bidirectional**: Two-way communication.
3. **Full-Duplex**: Both parties can send data simultaneously.
4. **Half-Duplex**: Devices take turns to send data (e.g., WiFi).

### **E. State Management**

1. **Stateful Protocols** (Maintain session information)
   - Examples: **TCP, gRPC, Apache Threads**
2. **Stateless Protocols** (Each request is independent)
   - Examples: **UDP, HTTP**

### **F. Routing & Proxying**

How a protocol interacts with networks and proxies.

- Example: **DNS resolution for Google.com**
  - DNS finds the IP → TCP connection is established → HTTP request is sent.
  - If a proxy is used, the connection first reaches the proxy, which forwards it to Google.

### **G. Reliability & Congestion Control**

- **Reliable Protocols**: Ensure correct delivery with retransmissions.
  - Example: **TCP (has flow control, congestion control, and retransmissions).**
- **Unreliable Protocols**: Best-effort delivery, no guarantees.
  - Example: **UDP (no retransmission or flow control).**

### **H. Error Handling**

- Defines how errors are managed:
  - **Standard error codes** (e.g., HTTP status codes).
  - **Timeouts & Retries**: Whether to resend lost requests.

---

## **4. Conclusion**

- Protocols define how data is structured, transmitted, and managed.
- Different protocols have different strengths based on their design choices.
- Understanding these properties helps in choosing or designing the right protocol for a use case.
