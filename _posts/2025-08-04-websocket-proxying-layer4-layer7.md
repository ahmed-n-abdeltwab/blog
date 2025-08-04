---
layout: article
title: "Understanding Layer 4 vs Layer 7 WebSocket Proxying"
date: 2025-08-04
modify_date: 2025-08-04
excerpt: "Explains how WebSocket connections are handled by proxies at Layer 4 (TCP) vs Layer 7 (HTTP), summarizing a lecture."
tags:
  [
    "Backend",
    "Networking",
    "LectureNotes",
    "Layer 4",
    "Layer 7",
    "WebSocket",
    "OSI layers",
    "nginx",
    "Hussein",
    "Protocols",
    "Software Engineering",
    "Fundamentals of Backend Engineering",
    "Proxy",
    "LoadBalancing",
  ]
mathjax: true
mathjax_autoNumber: true
key: websocket-proxying-layer4-layer7
---

# Understanding Layer 4 vs Layer 7 WebSocket Proxying

## Introduction

Have you ever wondered how a WebSocket connection is handled behind a proxy? In a recent lecture, I learned that proxies can operate at different OSI layers, and this choice changes how WebSocket traffic is processed. We focused on **Layer 4** (transport/TCP) versus **Layer 7** (application/HTTP) proxying. This matters in real-world apps (like chat or streaming services) because it affects encryption, routing, and performance. The main goal was to understand these differences and see examples (e.g., NGINX configs) to know when to use each approach.

## Core Concepts/Overview

At a high level, a **Layer 4 proxy** handles connections at the TCP level. It only sees IP addresses and port numbers, not the actual WebSocket/HTTP data. In this mode, the proxy forwards bytes blindly. By contrast, a **Layer 7 proxy** works at the HTTP level: it sees the full HTTP/WebSocket handshake, so it can read headers, URL paths, and even terminate TLS. As one source explains, _in Layer 4 the content remains encrypted (and uninspected), but in Layer 7 the content is decrypted and we can read headers, paths, URLs_.

When using WebSockets, the client first sends an HTTP request with an `Upgrade: websocket` header. A Layer 7 proxy intercepts this HTTP request and can forward or modify it. A Layer 4 proxy cannot parse HTTP; it simply passes the TCP handshake and WebSocket frames through as-is. In other words, Layer 4 proxying creates a **tunnel** for WebSocket traffic, whereas Layer 7 proxying participates in the HTTP handshake.

> _"Layer 4 load balancing handles traffic at the TCP level, routing packets without inspecting the application layer data."_

## Key Characteristics

- **Layer 4 (TCP) proxying:**

  - **No application insight:** Only TCP/IP details (source/dest IP and ports) are visible. The proxy cannot see WebSocket headers or paths.
  - **Encrypted tunnel:** WebSocket data (and TLS) is forwarded blindly. The proxy does not decrypt the traffic.
  - **Dumb forwarding:** Acts as a tunnel – any data sent from client to proxy is sent unchanged to the backend. One tutorial notes _"Layer 4 proxying blindly tunnels everything to the backend"_.
  - **Protocol-agnostic:** Supports any TCP protocol (WebSocket, databases, etc.) since it doesn't need to understand the content.
  - **Single path:** Cannot route by HTTP path or domain. For example, _all_ traffic on port 8080 will go to one backend, ignoring URL paths.

- **Layer 7 (HTTP) proxying:**

  - **Full HTTP view:** The proxy reads HTTP headers and bodies. It sees the WebSocket upgrade request, host, path, and so on.
  - **TLS termination:** Often the proxy decrypts TLS (if used), so it sees plaintext WebSocket data. It then may re-encrypt when sending to the server.
  - **Routing flexibility:** Can route requests based on hostname or URL path (e.g. `/chat` vs `/stream`). This is not possible in raw L4 mode.
  - **Advanced features:** Can share backend connections (keep-alive), cache responses, or modify headers. Layer 7 allows sharing backend connections and caching results (useful for HTTP traffic).
  - **Resource use:** Has overhead for parsing and handling the protocol. It needs valid certificates and more CPU for SSL/TLS operations.

## Advantages & Disadvantages

- **Layer 4 (TCP) Proxy:**

  - _Pros:_ Very lightweight and fast (no protocol parsing) and it preserves end-to-end encryption. It can support any TCP-based service and can do TLS passthrough (no proxy certificate needed).
  - _Cons:_ Cannot route by URL or inspect data. No caching or header rewrites. Each WebSocket is a separate TCP connection (no connection reuse). It also cannot enforce sticky sessions or content-based rules. In short, it’s a "dumb" proxy with no application logic.

- **Layer 7 (HTTP) Proxy:**

  - _Pros:_ Much more control. The proxy sees the WebSocket handshake and can apply rules or load-balance based on paths or hosts. It can reuse connections and cache HTTP content, and even modify or inspect messages if needed.
  - _Cons:_ More overhead. It must terminate SSL/TLS (decrypt) and parse HTTP, which costs CPU and adds latency. It requires valid certificates and only works for supported protocols (HTTP/WebSocket).

## Practical Implementations/Examples

- **NGINX as Layer 4 proxy:** In NGINX `stream {}` mode (TCP proxy) you might use a config like:

  ```nginx
  stream {
      server {
          listen 8080;
          proxy_pass websocket_servers;
      }
  }
  ```

  This means _any_ WebSocket client connecting to port 8080 is forwarded directly to the backend. As one guide notes, _"any connection request to port 8080 will be tunneled to the websocket app backend"_. In this setup, URL paths (like `/chat`) are ignored; the proxy is purely a TCP tunnel.

- **NGINX as Layer 7 proxy:** In the `http {}` context, you use a `location` block and enable WebSocket upgrades. For example:

  ```nginx
  location /wsapp/ {
      proxy_pass http://backend;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
  }
  ```

  This reads the URL path `/wsapp` and upgrades the connection to WebSocket. The lines `proxy_set_header Upgrade $http_upgrade` and `proxy_set_header Connection "Upgrade"` are required to forward the WebSocket handshake. (See example config.) In Layer 7 mode, NGINX terminates TLS with its own certificate, whereas in Layer 4 mode the TLS handshake would pass through to the backend (preserving encryption).

## Conclusion

**Main takeaways:** Layer 4 proxying treats WebSocket connections as opaque TCP streams – it’s simple and transparent, but it can’t make routing decisions based on URL or headers. Layer 7 proxying lets the proxy participate in the HTTP handshake – it can read headers and route flexibly, but it costs more resources. For backend developers, this means choosing carefully: use a Layer 4 (stream) proxy when you need speed and simplicity, and use a Layer 7 (HTTP) proxy when you need advanced features like path-based routing.

Reflecting on the lecture, I realize that both methods support WebSockets, but in very different ways. In practice, a Layer 4 approach might suffice for simple load balancing, while an application-layer proxy is needed for complex routing or security. This understanding will help me debug connection issues and configure proxies correctly in future projects.
