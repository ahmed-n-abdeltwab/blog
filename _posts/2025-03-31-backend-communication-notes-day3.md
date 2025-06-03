---
layout: article
title: "Backend Communication Fundamentals: Day 3 Notes"
date: 2025-03-31
modify_date: 2025-03-31
excerpt: "Exploring real-time communication models and their tradeoffs in backend systems."
tags:
  [
    "Backend",
    "Real-Time",
    "WebSocket",
    "SSE",
    "Polling",
    "Hussein",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
  ]
mathjax: true
mathjax_autoNumber: true
key: backend-communication-notes-day3
---

## **Backend Communication Fundamentals: Day 3**

## **🔹 Section 1: Real-Time Communication Models**

### **📌 Key Vocabulary**

1. **Push Model**: Server proactively sends data to clients without explicit requests.
2. **Short Polling**: Client repeatedly sends requests to check for updates.
3. **Long Polling**: Client sends a request that the server holds open until data is available.
4. **Server-Sent Events (SSE)**: Server streams updates over a single long-lived HTTP connection.
5. **Chattiness**: Excessive network traffic due to frequent requests/responses.
6. **EventSource**: Browser API for handling SSE connections.
7. **Bidirectional Protocol**: Communication where both sides can send/receive (e.g., WebSocket).
8. **HTTP Chunked Encoding**: Method to stream data in chunks within a single response.

---

## **🔹 Section 2: Core Communication Strategies**

### **📌 Key Concepts**

#### **1️⃣ Push Model (WebSocket)**

```javascript
// WebSocket client implementation
const socket = new WebSocket("wss://api.example.com/chat");
socket.onmessage = (event) => {
  console.log("New message:", event.data);
};
```

- **Pros**: True real-time, bidirectional communication.
- **Cons**: Requires persistent connection, complex scaling.
- **Use Case**: Multiplayer games, collaborative editing tools.

#### **2️⃣ Server-Sent Events (SSE)**

```javascript
// Client-side SSE implementation
const eventSource = new EventSource("/updates");
eventSource.onmessage = (e) => {
  console.log("Update:", e.data);
};
```

- **Flow Control**: Automatically handled by HTTP/2 multiplexing.
- **Limitation**: Unidirectional; clients can't send data.

#### **3️⃣ Polling Tradeoffs**

- **Short Polling**:

  ```bash
  # Example cURL short polling
  while true; do curl https://api.example.com/status; sleep 5; done
  ```

- **Long Polling**: Reduces empty responses but requires reconnection logic.

---

## **🔹 Section 3: Technical Comparisons**

| **Feature**           | **WebSocket**         | **SSE**         | **Long Polling**        |
| --------------------- | --------------------- | --------------- | ----------------------- |
| **Latency**           | ~1ms                  | ~100ms          | 100ms-5s                |
| **Data Direction**    | Bidirectional         | Server → Client | Client-initiated        |
| **Protocol Overhead** | Low (after handshake) | Moderate        | High (repeated headers) |
| **Browser Limits**    | Unlimited             | 6 per domain    | 6 per domain            |

---

## **🔹 Section 4: Implementation Challenges**

### **📌 Flow Control in Push Systems**

- **Problem**: A fast server can overwhelm clients with data.
- **Solutions**:
  1. Back pressure mechanisms (e.g., HTTP/2 window sizing).
  2. Acknowledgment-based delivery (e.g., MQTT QoS levels).

### **📌 Connection Pooling & Limits**

- Browsers allow only **6 concurrent connections** to a single domain.
- **Workaround**: Use subdomains or HTTP/2 multiplexing.

---

## **🔹 Section 5: Key Takeaways**

- 🚀 **WebSocket** is ideal for chat apps but requires stateful infrastructure.
- 📡 **SSE** outperforms polling for stock tickers/news feeds with HTTP simplicity.
- ⚠️ **Avoid short polling** for frequent updates – wastes 95% of bandwidth on empty responses.
- 🔄 **Long polling** bridges the gap between real-time needs and HTTP limitations.

---

## **🔮 Next Steps**

- **Deep dive into Pub/Sub**: How Redis and Kafka implement publish-subscribe patterns.
- **Multiplexing vs Demultiplexing**: HTTP/2 proxies vs traditional connection pooling.
- **Stateful vs Stateless**: Trade offs in session management and horizontal scaling.
- **Sidecar Pattern**: Decoupling infrastructure concerns in microservices.
