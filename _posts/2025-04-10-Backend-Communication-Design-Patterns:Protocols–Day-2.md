---
layout: article
title: "Backend Communication Fundamentals: Protocols (Day 2)"
date: 2025-04-10
modify_date: 2025-04-10
excerpt: "A comprehensive review of the OSI model, networking layers, and communication fundamentals including session, presentation, transport layers, proxying, and execution in backend systems."
tags: ["BackendEngineering", "Networking", "APIs", "OSI", "Protocols", "TCP/IP", "Microservices", "SystemDesign", "Performance", "Scalability"]
mathjax: true
mathjax_autoNumber: true
key: backend-communication-protocols-day2
---

# Backend Communication Design Patterns: Protocols – Day 2

## 1. **Introduction to the OSI Model**
- **OSI Model**: Stands for Open Systems Interconnection model. It divides the networking process into seven layers.
- **Purpose**: To standardize communication across different devices and networks so that applications can interact without worrying about the underlying hardware or transmission medium.
- **Historical Note**: The lecturer recalls struggling with the model at university but later realized its importance for building agnostic networked applications.

## 2. **Why the OSI Model Matters**
- **Standardization**: By having a common set of layers, different systems (e.g., WiFi, Ethernet, LTE) can work together seamlessly.
- **Interoperability**: Applications do not need separate versions for different networking media because the lower layers take care of converting data between, for example, electrical signals and light.
- **Network Equipment Management**: Standard layers make it easier to upgrade or modify equipment because each layer can be updated independently.
- **Application Placement**: Understanding which layer an application works on (or which layers it touches) helps optimize performance and troubleshoot issues. For example, figuring out whether you're dealing with MAC addresses, IP packets, or higher-level data (like JSON).

## 3. **Layer Functions and Their Importance**
### **A. Physical and Data Link Layers (Layers 1 & 2)**
- **Physical Layer**: Concerns the actual transmission media (electrical signals, light, radio waves). It converts frames into signals.
- **Data Link Layer**: Deals with frames containing MAC addresses. Switches operate here by looking at the destination MAC address to forward traffic.

### **B. Network Layer (Layer 3)**
- **Function**: Responsible for routing packets using IP addresses. Routers work at this layer.
- **Key Concept**: IP packets are created from lower layers and help determine the best path between sender and receiver.
  
  **Example**: Debugging ICMP (Layer 3) with `tcpdump`:
  ```bash
  sudo tcpdump -n -i eth0 icmp
  ```
  **Output**:
  ```
  10:00:03.789 IP 192.168.1.100 > 8.8.8.8: ICMP echo request, id 123, seq 1
  10:00:03.790 IP 8.8.8.8 > 192.168.1.100: ICMP echo reply, id 123, seq 1
  ```
  - Captures ping requests/replies at the **Network Layer**, useful for diagnosing routing issues.

### **C. Transport Layer (Layer 4)**
- **Main Protocols**: TCP and UDP.
  - **TCP**: Provides reliable, stateful communication with flow and congestion control, ensuring correct sequencing with segments.
  - **UDP**: Stateless and provides a simpler form of communication without connection establishment.
- **Importance**: Almost all applications use either TCP or UDP as the foundation of data transmission.

  **Example**: Observing TCP Handshake (Layer 4):
  ```bash
  sudo tcpdump -n -i eth0 'tcp port 80 and (tcp-syn or tcp-ack)'
  ```
  **Output**:
  ```
  10:00:01.123 IP 192.168.1.100.54321 > 203.0.113.5.80: Flags [S], seq 123456
  10:00:01.124 IP 203.0.113.5.80 > 192.168.1.100.54321: Flags [S.], seq 654321, ack 123457
  10:00:01.125 IP 192.168.1.100.54321 > 203.0.113.5.80: Flags [.], ack 654322
  ```
  - Shows the SYN (synchronize), SYN-ACK (synchronize-acknowledge), and ACK (acknowledge) sequence for connection establishment.

### **D. Session, Presentation, and Application Layers (Layers 5 – 7)**
- **Session Layer (Layer 5)**:
  - Manages connection establishment, state, and termination.
  - In some applications, this layer is crucial (e.g., managing TLS handshakes or connection pooling in proxies).

  **Example**: TLS Handshake (Layer 5):
  ```bash
  sudo tcpdump -n -i eth0 'tcp port 443 and (tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn|tcp-ack)'
  ```
  - Captures the initial TCP handshake for HTTPS, where the **Session Layer** later handles TLS negotiation.

- **Presentation Layer (Layer 6)**:
  - Takes care of data serialization (e.g., converting JSON objects to byte strings) and encoding.
  - Acts as the interface between raw data and application data.
  
- **Application Layer (Layer 7)**:
  - Where end-user applications operate, handling business logic and protocols such as HTTP, FTP, or gRPC.
  - Many network devices, like reverse proxies and load balancers, operate here by parsing application-level data.

  **Example**: HTTP Traffic via Reverse Proxy (Layer 7):
  ```bash
  sudo tcpdump -A -s0 'tcp port 80 and host 203.0.113.5'
  ```
  **Output**:
  ```
  GET /api/v1/data HTTP/1.1
  Host: api.example.com
  User-Agent: curl/7.68.0

  HTTP/1.1 200 OK
  Content-Type: application/json
  {"status": "success", "data": [...]}
  ```
  - Reverse proxies inspect **Layer 7** headers (e.g., `Host`) to route requests.

## 4. **Detailed Example: From Client Request to Server Reception**
- **Step-by-Step Transmission**:
  - **Sending Side**:
    - The application generates a POST request with JSON data.
    - The presentation layer serializes the JSON.
    - The session layer initiates connection establishment (e.g., via a TCP handshake, as shown in the `tcpdump` example above).
    - The transport layer packages data into segments (using TCP or UDP).
    - The network layer puts segments into IP packets using destination and source IP addresses.
    - The data link layer encapsulates the packet in a frame with MAC addresses.
    - The physical layer converts frames into signals (electrical, light, or radio).
  - **Receiving Side**:
    - Signals are captured at the physical layer and converted back into bits.
    - The data link layer assembles frames and verifies MAC addresses.
    - The network layer extracts IP packets and uses routing information.
    - The transport layer reassembles segments, checking for connection state.
    - The session and presentation layers reconstruct the original data (e.g., deserialize the JSON).
    - Finally, the application processes the request.

## 5. **Networking Devices and How They Operate**
- **Switches**: Work at the data link layer by inspecting MAC addresses; efficiently forward frames within a subnet.
- **Routers**: Operate at the network layer; use IP addresses to forward packets across different subnets.
- **Firewalls and Proxies**: 
  - **Firewalls** inspect IP addresses and ports; transparent firewalls typically do not decrypt content.

    **Example**: Debugging a Firewall Blocking SSH (Layer 3/4):
    ```bash
    sudo tcpdump -n -i eth0 'tcp port 22 and (host 192.168.1.100)'
    ```
    - If SYN packets (`Flags [S]`) are sent but no SYN-ACK is received, the firewall is likely blocking traffic.

  - **Proxies (and Reverse Proxies)** sit at higher layers (e.g., application layer) and may decrypt, inspect, cache, and then forward traffic (see Layer 7 `tcpdump` example above).
- **Content Delivery Networks (CDNs)**: Essentially act as layer 7 reverse proxies that cache and serve content closer to the end-user.

## 6. **Additional Observations**
- **Layer Blurring**: In real-world systems, the strict boundaries between layers can blur. Sometimes a network device might interact with multiple layers at once.
- **Criticism of the OSI Model**: Although some argue that models like TCP/IP simplify or collapse several layers (e.g., combining session, presentation, and application layers), the finer granularity of the OSI model offers insight into where specific functions reside.
- **Performance Trade-offs**: Devices like proxies may introduce latency because they have to decrypt and inspect higher-layer data.

## 7. **Conclusion**
- The OSI model is fundamental in understanding how data moves across a network.
- Knowing which layer your application or device operates on helps in optimizing communication, troubleshooting issues, and designing efficient, scalable systems.
- **Practical Tip**: Use `tcpdump` to map real-world traffic to OSI layers (e.g., ICMP for Layer 3, TCP handshakes for Layer 4, HTTP headers for Layer 7).
- Embrace the model as a useful abstraction—even if in practice some of the lines between the layers are not always strictly followed.

